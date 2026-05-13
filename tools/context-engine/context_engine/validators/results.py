"""Validation result types."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class IssueLevel(str, Enum):
    info = "info"
    warning = "warning"
    error = "error"


class Issue(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    level: IssueLevel
    code: str
    message: str
    target: str | None = None
    suggestion: str | None = None


class ValidationReport(BaseModel):
    model_config = ConfigDict(extra="forbid")
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    issues: list[Issue] = Field(default_factory=list)

    def add(
        self,
        level: IssueLevel,
        code: str,
        message: str,
        *,
        target: str | None = None,
        suggestion: str | None = None,
    ) -> None:
        self.issues.append(
            Issue(
                level=level,
                code=code,
                message=message,
                target=target,
                suggestion=suggestion,
            )
        )

    @property
    def error_count(self) -> int:
        return sum(1 for i in self.issues if i.level == IssueLevel.error)

    @property
    def warning_count(self) -> int:
        return sum(1 for i in self.issues if i.level == IssueLevel.warning)

    @property
    def passed(self) -> bool:
        return self.error_count == 0
