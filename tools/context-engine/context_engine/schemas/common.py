"""Shared schema primitives."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class Confidence(str, Enum):
    """How well-supported a claim is by code evidence.

    The hierarchy is strict:

    - ``verified``  : symbol + reference + (optional) test exist on disk
    - ``partial``   : file exists and at least one supporting symbol/reference exists
    - ``inferred``  : structural heuristic only (filename, folder placement)
    - ``uncertain`` : NO direct evidence; should never appear in shipped claims
    """

    verified = "verified"
    partial = "partial"
    inferred = "inferred"
    uncertain = "uncertain"


class FileRef(BaseModel):
    """Reference to a file in the repository, with optional symbol/line anchor."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    path: Annotated[str, Field(description="Repo-relative POSIX path")]
    symbol: str | None = None
    line: int | None = Field(default=None, ge=1)

    def __str__(self) -> str:  # pragma: no cover - trivial
        if self.symbol and self.line:
            return f"{self.path}:{self.line} ({self.symbol})"
        if self.symbol:
            return f"{self.path} ({self.symbol})"
        if self.line:
            return f"{self.path}:{self.line}"
        return self.path


class ImplementationEvidence(BaseModel):
    """Concrete, on-disk support for a claim.

    Empty evidence means a claim is unsupported and must NOT be promoted to
    documentation. Generators enforce this.
    """

    model_config = ConfigDict(extra="forbid")

    source_files: list[FileRef] = Field(default_factory=list)
    referenced_by: list[FileRef] = Field(default_factory=list)
    routes: list[str] = Field(default_factory=list)
    tests: list[FileRef] = Field(default_factory=list)
    confidence: Confidence = Confidence.uncertain
    notes: str | None = None

    @property
    def is_empty(self) -> bool:
        return not (self.source_files or self.referenced_by or self.routes or self.tests)

    def downgrade_if_unsupported(self) -> "ImplementationEvidence":
        """Force confidence down to the level the evidence actually justifies."""
        if self.is_empty:
            return self.model_copy(update={"confidence": Confidence.uncertain})
        if not self.source_files:
            return self.model_copy(update={"confidence": Confidence.inferred})
        if not self.referenced_by and not self.tests:
            return self.model_copy(update={"confidence": min(self.confidence, Confidence.partial, key=_confidence_rank)})
        return self


def _confidence_rank(c: Confidence) -> int:
    return {
        Confidence.uncertain: 0,
        Confidence.inferred: 1,
        Confidence.partial: 2,
        Confidence.verified: 3,
    }[c]
