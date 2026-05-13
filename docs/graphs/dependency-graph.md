# Dependency graph

```mermaid
graph LR
    _cursor_rules_context_engine_mdc[".cursor/rules/context-engine.mdc"]
    docs_adr_0001_context_intelligence_engine_md["docs/adr/0001-context-intelligence-engine.md"]
    docs_generated_component_map_md["docs/generated/component-map.md"]
    docs_generated_dependency_map_md["docs/generated/dependency-map.md"]
    docs_generated_feature_map_md["docs/generated/feature-map.md"]
    docs_generated_route_map_md["docs/generated/route-map.md"]
    docs_generated_system_map_md["docs/generated/system-map.md"]
    docs_graphs_dependency_graph_md["docs/graphs/dependency-graph.md"]
    docs_graphs_feature_graph_md["docs/graphs/feature-graph.md"]
    project_metadata_architecture_routes_yaml["project-metadata/architecture/routes.yaml"]
    project_metadata_current_state_snapshot_json["project-metadata/current-state/snapshot.json"]
    project_metadata_features_battle_sim_yaml["project-metadata/features/battle_sim.yaml"]
    project_metadata_features_carousel_yaml["project-metadata/features/carousel.yaml"]
    project_metadata_features_compare_yaml["project-metadata/features/compare.yaml"]
    project_metadata_features_comparison_card_export_yaml["project-metadata/features/comparison_card_export.yaml"]
    project_metadata_features_discovery_yaml["project-metadata/features/discovery.yaml"]
    project_metadata_features_overlay_yaml["project-metadata/features/overlay.yaml"]
    project_metadata_features_team_builder_yaml["project-metadata/features/team_builder.yaml"]
    project_metadata_systems_a11y_yaml["project-metadata/systems/a11y.yaml"]
    project_metadata_systems_app_providers_yaml["project-metadata/systems/app-providers.yaml"]
    project_metadata_systems_motion_yaml["project-metadata/systems/motion.yaml"]
    project_metadata_systems_pokeapi_services_yaml["project-metadata/systems/pokeapi-services.yaml"]
    project_metadata_systems_query_layer_yaml["project-metadata/systems/query-layer.yaml"]
    project_metadata_systems_rules_engines_yaml["project-metadata/systems/rules-engines.yaml"]
    project_metadata_systems_zustand_stores_yaml["project-metadata/systems/zustand-stores.yaml"]
    scripts_context_engine_ci_ps1["scripts/context-engine-ci.ps1"]
    scripts_context_engine_ci_sh["scripts/context-engine-ci.sh"]
    scripts_pre_commit_context_sh["scripts/pre-commit-context.sh"]
    src_App_tsx["App.tsx"]
    src_a11y_carouselAngle_test_ts["a11y/carouselAngle.test.ts"]
    src_a11y_carouselAngle_ts["a11y/carouselAngle.ts"]
    src_a11y_getFocusable_test_ts["a11y/getFocusable.test.ts"]
    src_a11y_getFocusable_ts["a11y/getFocusable.ts"]
    src_a11y_nextTrappedIndex_test_ts["a11y/nextTrappedIndex.test.ts"]
    src_a11y_nextTrappedIndex_ts["a11y/nextTrappedIndex.ts"]
    src_a11y_useFocusTrap_ts["a11y/useFocusTrap.ts"]
    src_components_pokemon_TypeBadge_tsx["components/pokemon/TypeBadge.tsx"]
    src_components_ui_AsyncFeedback_tsx["components/ui/AsyncFeedback.tsx"]
    src_components_ui_PanelSkeletons_tsx["components/ui/PanelSkeletons.tsx"]
    src_core_feature_registry_ts["core/feature-registry.ts"]
    src_data_legendaryMythicalPool_ts["data/legendaryMythicalPool.ts"]
    src_data_pokeballs_ts["data/pokeballs.ts"]
    src_data_pokemonTypes_ts["data/pokemonTypes.ts"]
    src_data_pseudoLegendaryIds_ts["data/pseudoLegendaryIds.ts"]
    src_features_battle_sim_BattleSimulatorModal_tsx["features/battle-sim/BattleSimulatorModal.tsx"]
    src_features_battle_sim_battleSimulatorEngine_test_ts["features/battle-sim/battleSimulatorEngine.test.ts"]
    src_features_battle_sim_battleSimulatorEngine_ts["features/battle-sim/battleSimulatorEngine.ts"]
    src_features_battle_sim_battleSimulatorTypes_ts["features/battle-sim/battleSimulatorTypes.ts"]
    src_features_carousel_PokeBallCarousel_tsx["features/carousel/PokeBallCarousel.tsx"]
    src_features_compare_ComparisonModal_tsx["features/compare/ComparisonModal.tsx"]
    src_features_compare_ComparisonShareSurface_tsx["features/compare/ComparisonShareSurface.tsx"]
    src_features_compare_ComparisonStatBars_tsx["features/compare/ComparisonStatBars.tsx"]
    src_features_compare_compareTheme_ts["features/compare/compareTheme.ts"]
    src_features_compare_comparisonScoring_ts["features/compare/comparisonScoring.ts"]
    src_features_discovery_MyDexPanel_tsx["features/discovery/MyDexPanel.tsx"]
    src_features_discovery_discoveryEngine_ts["features/discovery/discoveryEngine.ts"]
    src_features_discovery_discoveryTypes_ts["features/discovery/discoveryTypes.ts"]
    src_features_discovery_discoveryUiStore_ts["features/discovery/discoveryUiStore.ts"]
    src_features_discovery_useMyDexDiscovery_ts["features/discovery/useMyDexDiscovery.ts"]
    src_features_overlay_BallDetailPanel_tsx["features/overlay/BallDetailPanel.tsx"]
    src_features_overlay_DetailsOverlay_tsx["features/overlay/DetailsOverlay.tsx"]
    src_features_overlay_PokemonDetailPanel_tsx["features/overlay/PokemonDetailPanel.tsx"]
    src_features_overlay_PokemonEvolutionTimeline_tsx["features/overlay/PokemonEvolutionTimeline.tsx"]
    src_features_team_builder_TeamBuilderModal_tsx["features/team-builder/TeamBuilderModal.tsx"]
    src_features_team_builder_teamBuilderEngine_test_ts["features/team-builder/teamBuilderEngine.test.ts"]
    src_features_team_builder_teamBuilderEngine_ts["features/team-builder/teamBuilderEngine.ts"]
    src_features_team_builder_teamBuilderTypes_ts["features/team-builder/teamBuilderTypes.ts"]
    src_features_team_builder_typeMatchupChart_ts["features/team-builder/typeMatchupChart.ts"]
    src_features_team_builder_useTeamBuilderData_ts["features/team-builder/useTeamBuilderData.ts"]
    src_hooks_useAppKeyboardShortcuts_ts["hooks/useAppKeyboardShortcuts.ts"]
    src_hooks_useMediaQuery_ts["hooks/useMediaQuery.ts"]
    src_hooks_usePokeBallCarousel_ts["hooks/usePokeBallCarousel.ts"]
    src_hooks_usePokemonCry_ts["hooks/usePokemonCry.ts"]
    src_hooks_usePrefersReducedMotion_ts["hooks/usePrefersReducedMotion.ts"]
    src_main_tsx["main.tsx"]
    src_motion_motionPrefs_ts["motion/motionPrefs.ts"]
    src_providers_AppAtmosphere_tsx["providers/AppAtmosphere.tsx"]
    src_providers_AppProviders_tsx["providers/AppProviders.tsx"]
    src_query_ballSuggestionsQuery_ts["query/ballSuggestionsQuery.ts"]
    src_query_createQueryClient_ts["query/createQueryClient.ts"]
    src_query_keys_ts["query/keys.ts"]
    src_query_prefetch_ts["query/prefetch.ts"]
    src_query_staleTimes_ts["query/staleTimes.ts"]
    src_query_useBallSuggestionsQuery_ts["query/useBallSuggestionsQuery.ts"]
    src_services_ballSuggestions_ts["services/ballSuggestions.ts"]
    src_services_pokeapi_abilityPokemon_ts["services/pokeapi/abilityPokemon.ts"]
    src_services_pokeapi_client_ts["services/pokeapi/client.ts"]
    src_services_pokeapi_comparisonProfile_ts["services/pokeapi/comparisonProfile.ts"]
    src_services_pokeapi_detailedPokemon_ts["services/pokeapi/detailedPokemon.ts"]
    src_services_pokeapi_evolution_ts["services/pokeapi/evolution.ts"]
    src_services_pokeapi_evolutionSpeciesLore_ts["services/pokeapi/evolutionSpeciesLore.ts"]
    src_services_pokeapi_generation_ts["services/pokeapi/generation.ts"]
    src_services_pokeapi_locations_ts["services/pokeapi/locations.ts"]
    src_services_pokeapi_mapSummary_ts["services/pokeapi/mapSummary.ts"]
    src_services_pokeapi_mega_ts["services/pokeapi/mega.ts"]
    src_services_pokeapi_pokedex_ts["services/pokeapi/pokedex.ts"]
    src_services_pokeapi_pokemonFormsIndex_ts["services/pokeapi/pokemonFormsIndex.ts"]
    src_services_pokeapi_pokemonListResource_ts["services/pokeapi/pokemonListResource.ts"]
    src_services_pokeapi_pokemonSummary_ts["services/pokeapi/pokemonSummary.ts"]
    src_services_pokeapi_resourceIds_ts["services/pokeapi/resourceIds.ts"]
    src_services_pokeapi_speciesEvolutionHint_ts["services/pokeapi/speciesEvolutionHint.ts"]
    src_services_pokeapi_typeEffectiveness_ts["services/pokeapi/typeEffectiveness.ts"]
    src_services_pokeapi_typeMatchupChart_ts["services/pokeapi/typeMatchupChart.ts"]
    src_services_pokeapi_typePokemonIds_ts["services/pokeapi/typePokemonIds.ts"]
    src_store_battleSimulatorStore_ts["store/battleSimulatorStore.ts"]
    src_store_comparisonStore_ts["store/comparisonStore.ts"]
    src_store_dexListsStore_ts["store/dexListsStore.ts"]
    src_store_teamBuilderStore_ts["store/teamBuilderStore.ts"]
    src_store_uiStore_ts["store/uiStore.ts"]
    src_types_pokeapi_ts["types/pokeapi.ts"]
    src_types_pokemon_ts["types/pokemon.ts"]
    src_utils_array_ts["utils/array.ts"]
    src_utils_evolutionTriggerSummary_test_ts["utils/evolutionTriggerSummary.test.ts"]
    src_utils_evolutionTriggerSummary_ts["utils/evolutionTriggerSummary.ts"]
    src_utils_pokemonMeta_ts["utils/pokemonMeta.ts"]
    src_utils_typeGradients_ts["utils/typeGradients.ts"]
    tools_context_engine_README_md["tools/context-engine/README.md"]
    tools_context_engine_context_engine___init___py["tools/context-engine/context_engine/__init__.py"]
    tools_context_engine_context_engine_cache___init___py["tools/context-engine/context_engine/cache/__init__.py"]
    tools_context_engine_context_engine_cache_file_cache_py["tools/context-engine/context_engine/cache/file_cache.py"]
    src_App_tsx --> src_features_battle_sim_BattleSimulatorModal_tsx
    src_App_tsx --> src_features_carousel_PokeBallCarousel_tsx
    src_App_tsx --> src_features_compare_ComparisonModal_tsx
    src_App_tsx --> src_features_discovery_MyDexPanel_tsx
    src_App_tsx --> src_features_overlay_DetailsOverlay_tsx
    src_App_tsx --> src_features_team_builder_TeamBuilderModal_tsx
    src_App_tsx --> src_hooks_useAppKeyboardShortcuts_ts
    src_App_tsx --> src_store_teamBuilderStore_ts
    src_a11y_carouselAngle_test_ts --> src_a11y_carouselAngle_ts
    src_a11y_getFocusable_test_ts --> src_a11y_getFocusable_ts
    src_a11y_nextTrappedIndex_test_ts --> src_a11y_nextTrappedIndex_ts
    src_a11y_useFocusTrap_ts --> src_a11y_getFocusable_ts
    src_components_pokemon_TypeBadge_tsx --> src_types_pokemon_ts
    src_components_pokemon_TypeBadge_tsx --> src_utils_typeGradients_ts
    src_data_pokeballs_ts --> src_types_pokemon_ts
    src_data_pokemonTypes_ts --> src_types_pokemon_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_a11y_useFocusTrap_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_components_pokemon_TypeBadge_tsx
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_features_battle_sim_battleSimulatorEngine_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_features_battle_sim_battleSimulatorTypes_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_features_team_builder_typeMatchupChart_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_hooks_usePrefersReducedMotion_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_motion_motionPrefs_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_query_keys_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_query_staleTimes_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_services_pokeapi_comparisonProfile_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_services_pokeapi_typeMatchupChart_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_store_battleSimulatorStore_ts
    src_features_battle_sim_BattleSimulatorModal_tsx --> src_types_pokemon_ts
    src_features_battle_sim_battleSimulatorEngine_test_ts --> src_features_battle_sim_battleSimulatorEngine_ts
    src_features_battle_sim_battleSimulatorEngine_test_ts --> src_features_battle_sim_battleSimulatorTypes_ts
    src_features_battle_sim_battleSimulatorEngine_test_ts --> src_features_team_builder_typeMatchupChart_ts
    src_features_battle_sim_battleSimulatorEngine_test_ts --> src_types_pokemon_ts
    src_features_battle_sim_battleSimulatorEngine_ts --> src_data_pokemonTypes_ts
    src_features_battle_sim_battleSimulatorEngine_ts --> src_features_battle_sim_battleSimulatorTypes_ts
    src_features_battle_sim_battleSimulatorEngine_ts --> src_features_team_builder_typeMatchupChart_ts
    src_features_battle_sim_battleSimulatorEngine_ts --> src_types_pokemon_ts
    src_features_battle_sim_battleSimulatorTypes_ts --> src_types_pokemon_ts
    src_features_carousel_PokeBallCarousel_tsx --> src_data_pokeballs_ts
    src_features_carousel_PokeBallCarousel_tsx --> src_hooks_usePokeBallCarousel_ts
    src_features_carousel_PokeBallCarousel_tsx --> src_query_prefetch_ts
    src_features_carousel_PokeBallCarousel_tsx --> src_store_uiStore_ts
    src_features_compare_ComparisonModal_tsx --> src_a11y_useFocusTrap_ts
    src_features_compare_ComparisonModal_tsx --> src_components_pokemon_TypeBadge_tsx
    src_features_compare_ComparisonModal_tsx --> src_features_compare_ComparisonShareSurface_tsx
    src_features_compare_ComparisonModal_tsx --> src_features_compare_ComparisonStatBars_tsx
    src_features_compare_ComparisonModal_tsx --> src_features_compare_compareTheme_ts
    src_features_compare_ComparisonModal_tsx --> src_features_compare_comparisonScoring_ts
    src_features_compare_ComparisonModal_tsx --> src_hooks_usePrefersReducedMotion_ts
    src_features_compare_ComparisonModal_tsx --> src_motion_motionPrefs_ts
    src_features_compare_ComparisonModal_tsx --> src_query_keys_ts
    src_features_compare_ComparisonModal_tsx --> src_query_staleTimes_ts
    src_features_compare_ComparisonModal_tsx --> src_services_pokeapi_comparisonProfile_ts
    src_features_compare_ComparisonModal_tsx --> src_services_pokeapi_typeEffectiveness_ts
    src_features_compare_ComparisonModal_tsx --> src_store_battleSimulatorStore_ts
    src_features_compare_ComparisonModal_tsx --> src_store_comparisonStore_ts
    src_features_compare_ComparisonModal_tsx --> src_types_pokemon_ts
    src_features_compare_ComparisonStatBars_tsx --> src_types_pokemon_ts
    src_features_compare_compareTheme_ts --> src_types_pokemon_ts
    src_features_compare_comparisonScoring_ts --> src_types_pokemon_ts
    src_features_discovery_MyDexPanel_tsx --> src_a11y_useFocusTrap_ts
    src_features_discovery_MyDexPanel_tsx --> src_components_pokemon_TypeBadge_tsx
    src_features_discovery_MyDexPanel_tsx --> src_components_ui_PanelSkeletons_tsx
    src_features_discovery_MyDexPanel_tsx --> src_data_pokemonTypes_ts
    src_features_discovery_MyDexPanel_tsx --> src_features_discovery_discoveryUiStore_ts
    src_features_discovery_MyDexPanel_tsx --> src_features_discovery_useMyDexDiscovery_ts
    src_features_discovery_MyDexPanel_tsx --> src_hooks_usePrefersReducedMotion_ts
    src_features_discovery_MyDexPanel_tsx --> src_motion_motionPrefs_ts
    src_features_discovery_MyDexPanel_tsx --> src_store_comparisonStore_ts
    src_features_discovery_MyDexPanel_tsx --> src_store_dexListsStore_ts
    src_features_discovery_MyDexPanel_tsx --> src_store_uiStore_ts
    src_features_discovery_discoveryEngine_ts --> src_features_discovery_discoveryTypes_ts
    src_features_discovery_discoveryEngine_ts --> src_services_pokeapi_pokemonFormsIndex_ts
    src_features_discovery_discoveryEngine_ts --> src_services_pokeapi_pokemonListResource_ts
    src_features_discovery_discoveryEngine_ts --> src_types_pokemon_ts
    src_features_discovery_discoveryTypes_ts --> src_types_pokemon_ts
    src_features_discovery_discoveryUiStore_ts --> src_features_discovery_discoveryTypes_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_features_discovery_discoveryEngine_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_features_discovery_discoveryUiStore_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_query_keys_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_query_staleTimes_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_abilityPokemon_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_generation_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_pokedex_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_pokemonFormsIndex_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_pokemonListResource_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_pokemonSummary_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_speciesEvolutionHint_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_services_pokeapi_typePokemonIds_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_store_dexListsStore_ts
    src_features_discovery_useMyDexDiscovery_ts --> src_types_pokemon_ts
    src_features_overlay_BallDetailPanel_tsx --> src_components_ui_AsyncFeedback_tsx
    src_features_overlay_BallDetailPanel_tsx --> src_components_ui_PanelSkeletons_tsx
    src_features_overlay_BallDetailPanel_tsx --> src_data_pokeballs_ts
    src_features_overlay_BallDetailPanel_tsx --> src_query_prefetch_ts
    src_features_overlay_BallDetailPanel_tsx --> src_query_useBallSuggestionsQuery_ts
    src_features_overlay_BallDetailPanel_tsx --> src_store_uiStore_ts
    src_features_overlay_BallDetailPanel_tsx --> src_types_pokemon_ts
    src_features_overlay_DetailsOverlay_tsx --> src_a11y_useFocusTrap_ts
    src_features_overlay_DetailsOverlay_tsx --> src_data_pokeballs_ts
    src_features_overlay_DetailsOverlay_tsx --> src_features_overlay_BallDetailPanel_tsx
    src_features_overlay_DetailsOverlay_tsx --> src_features_overlay_PokemonDetailPanel_tsx
    src_features_overlay_DetailsOverlay_tsx --> src_hooks_usePrefersReducedMotion_ts
    src_features_overlay_DetailsOverlay_tsx --> src_motion_motionPrefs_ts
    src_features_overlay_DetailsOverlay_tsx --> src_store_uiStore_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_components_pokemon_TypeBadge_tsx
    src_features_overlay_PokemonDetailPanel_tsx --> src_components_ui_AsyncFeedback_tsx
    src_features_overlay_PokemonDetailPanel_tsx --> src_components_ui_PanelSkeletons_tsx
    src_features_overlay_PokemonDetailPanel_tsx --> src_features_overlay_PokemonEvolutionTimeline_tsx
    src_features_overlay_PokemonDetailPanel_tsx --> src_hooks_usePokemonCry_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_hooks_usePrefersReducedMotion_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_motion_motionPrefs_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_query_keys_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_query_staleTimes_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_services_pokeapi_detailedPokemon_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_services_pokeapi_evolution_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_services_pokeapi_evolutionSpeciesLore_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_services_pokeapi_typeEffectiveness_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_store_comparisonStore_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_store_dexListsStore_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_store_uiStore_ts
    src_features_overlay_PokemonDetailPanel_tsx --> src_types_pokemon_ts
    src_features_overlay_PokemonEvolutionTimeline_tsx --> src_components_pokemon_TypeBadge_tsx
    src_features_overlay_PokemonEvolutionTimeline_tsx --> src_components_ui_AsyncFeedback_tsx
    src_features_overlay_PokemonEvolutionTimeline_tsx --> src_components_ui_PanelSkeletons_tsx
    src_features_overlay_PokemonEvolutionTimeline_tsx --> src_motion_motionPrefs_ts
    src_features_overlay_PokemonEvolutionTimeline_tsx --> src_types_pokemon_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_a11y_useFocusTrap_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_components_pokemon_TypeBadge_tsx
    src_features_team_builder_TeamBuilderModal_tsx --> src_data_pokemonTypes_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_features_team_builder_teamBuilderEngine_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_features_team_builder_teamBuilderTypes_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_features_team_builder_useTeamBuilderData_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_hooks_usePrefersReducedMotion_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_motion_motionPrefs_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_store_dexListsStore_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_store_teamBuilderStore_ts
    src_features_team_builder_TeamBuilderModal_tsx --> src_types_pokemon_ts
    src_features_team_builder_teamBuilderEngine_test_ts --> src_features_team_builder_teamBuilderEngine_ts
    src_features_team_builder_teamBuilderEngine_test_ts --> src_features_team_builder_teamBuilderTypes_ts
    src_features_team_builder_teamBuilderEngine_test_ts --> src_features_team_builder_typeMatchupChart_ts
    src_features_team_builder_teamBuilderEngine_test_ts --> src_types_pokemon_ts
    src_features_team_builder_teamBuilderEngine_ts --> src_data_pokemonTypes_ts
    src_features_team_builder_teamBuilderEngine_ts --> src_features_team_builder_teamBuilderTypes_ts
    src_features_team_builder_teamBuilderEngine_ts --> src_features_team_builder_typeMatchupChart_ts
    src_features_team_builder_teamBuilderEngine_ts --> src_types_pokemon_ts
    src_features_team_builder_teamBuilderTypes_ts --> src_types_pokemon_ts
    src_features_team_builder_typeMatchupChart_ts --> src_data_pokemonTypes_ts
    src_features_team_builder_typeMatchupChart_ts --> src_types_pokeapi_ts
    src_features_team_builder_typeMatchupChart_ts --> src_types_pokemon_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_features_discovery_discoveryEngine_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_features_team_builder_typeMatchupChart_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_query_keys_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_query_staleTimes_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_services_pokeapi_generation_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_services_pokeapi_pokemonListResource_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_services_pokeapi_pokemonSummary_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_services_pokeapi_typeMatchupChart_ts
    src_features_team_builder_useTeamBuilderData_ts --> src_types_pokemon_ts
    src_hooks_useAppKeyboardShortcuts_ts --> src_features_discovery_discoveryUiStore_ts
    src_hooks_useAppKeyboardShortcuts_ts --> src_store_battleSimulatorStore_ts
    src_hooks_useAppKeyboardShortcuts_ts --> src_store_comparisonStore_ts
    src_hooks_useAppKeyboardShortcuts_ts --> src_store_teamBuilderStore_ts
    src_hooks_useAppKeyboardShortcuts_ts --> src_store_uiStore_ts
    src_hooks_usePokeBallCarousel_ts --> src_a11y_carouselAngle_ts
    src_hooks_usePokeBallCarousel_ts --> src_hooks_useMediaQuery_ts
    src_hooks_usePokeBallCarousel_ts --> src_hooks_usePrefersReducedMotion_ts
    src_hooks_usePokemonCry_ts --> src_services_pokeapi_client_ts
    src_hooks_usePokemonCry_ts --> src_types_pokemon_ts
    src_hooks_usePrefersReducedMotion_ts --> src_hooks_useMediaQuery_ts
    src_main_tsx --> src_App_tsx
    src_main_tsx --> src_providers_AppProviders_tsx
    src_providers_AppAtmosphere_tsx --> src_query_keys_ts
    src_providers_AppAtmosphere_tsx --> src_query_staleTimes_ts
    src_providers_AppAtmosphere_tsx --> src_services_pokeapi_detailedPokemon_ts
    src_providers_AppAtmosphere_tsx --> src_store_uiStore_ts
    src_providers_AppProviders_tsx --> src_providers_AppAtmosphere_tsx
    src_providers_AppProviders_tsx --> src_query_createQueryClient_ts
    src_query_ballSuggestionsQuery_ts --> src_data_legendaryMythicalPool_ts
    src_query_ballSuggestionsQuery_ts --> src_data_pokeballs_ts
    src_query_ballSuggestionsQuery_ts --> src_data_pseudoLegendaryIds_ts
    src_query_ballSuggestionsQuery_ts --> src_query_keys_ts
    src_query_ballSuggestionsQuery_ts --> src_query_staleTimes_ts
    src_query_ballSuggestionsQuery_ts --> src_services_ballSuggestions_ts
    src_query_ballSuggestionsQuery_ts --> src_services_pokeapi_pokemonListResource_ts
    src_query_ballSuggestionsQuery_ts --> src_services_pokeapi_pokemonSummary_ts
    src_query_ballSuggestionsQuery_ts --> src_services_pokeapi_typePokemonIds_ts
    src_query_ballSuggestionsQuery_ts --> src_types_pokemon_ts
    src_query_ballSuggestionsQuery_ts --> src_utils_array_ts
    src_query_createQueryClient_ts --> src_services_pokeapi_client_ts
    src_query_prefetch_ts --> src_data_pokeballs_ts
    src_query_prefetch_ts --> src_query_ballSuggestionsQuery_ts
    src_query_prefetch_ts --> src_query_keys_ts
    src_query_prefetch_ts --> src_query_staleTimes_ts
    src_query_prefetch_ts --> src_services_pokeapi_detailedPokemon_ts
    src_query_useBallSuggestionsQuery_ts --> src_data_pokeballs_ts
    src_query_useBallSuggestionsQuery_ts --> src_query_ballSuggestionsQuery_ts
    src_query_useBallSuggestionsQuery_ts --> src_query_keys_ts
    src_query_useBallSuggestionsQuery_ts --> src_query_staleTimes_ts
    src_services_ballSuggestions_ts --> src_data_pokeballs_ts
    src_services_ballSuggestions_ts --> src_types_pokemon_ts
    src_services_ballSuggestions_ts --> src_utils_array_ts
    src_services_pokeapi_abilityPokemon_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_abilityPokemon_ts --> src_services_pokeapi_resourceIds_ts
    src_services_pokeapi_abilityPokemon_ts --> src_types_pokeapi_ts
    src_services_pokeapi_comparisonProfile_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_comparisonProfile_ts --> src_types_pokeapi_ts
    src_services_pokeapi_comparisonProfile_ts --> src_types_pokemon_ts
    src_services_pokeapi_detailedPokemon_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_detailedPokemon_ts --> src_services_pokeapi_locations_ts
    src_services_pokeapi_detailedPokemon_ts --> src_services_pokeapi_mega_ts
    src_services_pokeapi_detailedPokemon_ts --> src_types_pokeapi_ts
    src_services_pokeapi_detailedPokemon_ts --> src_types_pokemon_ts
    src_services_pokeapi_detailedPokemon_ts --> src_utils_pokemonMeta_ts
    src_services_pokeapi_evolution_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_evolution_ts --> src_types_pokeapi_ts
    src_services_pokeapi_evolution_ts --> src_types_pokemon_ts
    src_services_pokeapi_evolutionSpeciesLore_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_evolutionSpeciesLore_ts --> src_types_pokeapi_ts
    src_services_pokeapi_evolutionSpeciesLore_ts --> src_types_pokemon_ts
    src_services_pokeapi_evolutionSpeciesLore_ts --> src_utils_evolutionTriggerSummary_ts
    src_services_pokeapi_generation_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_generation_ts --> src_services_pokeapi_resourceIds_ts
    src_services_pokeapi_generation_ts --> src_types_pokeapi_ts
    src_services_pokeapi_locations_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_locations_ts --> src_types_pokeapi_ts
    src_services_pokeapi_locations_ts --> src_types_pokemon_ts
    src_services_pokeapi_mapSummary_ts --> src_types_pokeapi_ts
    src_services_pokeapi_mapSummary_ts --> src_types_pokemon_ts
    src_services_pokeapi_mapSummary_ts --> src_utils_pokemonMeta_ts
    src_services_pokeapi_mega_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_mega_ts --> src_types_pokeapi_ts
    src_services_pokeapi_mega_ts --> src_types_pokemon_ts
    src_services_pokeapi_pokedex_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_pokedex_ts --> src_services_pokeapi_resourceIds_ts
    src_services_pokeapi_pokedex_ts --> src_types_pokeapi_ts
    src_services_pokeapi_pokemonFormsIndex_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_pokemonFormsIndex_ts --> src_services_pokeapi_resourceIds_ts
    src_services_pokeapi_pokemonFormsIndex_ts --> src_types_pokeapi_ts
    src_services_pokeapi_pokemonListResource_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_pokemonListResource_ts --> src_services_pokeapi_resourceIds_ts
    src_services_pokeapi_pokemonListResource_ts --> src_types_pokeapi_ts
    src_services_pokeapi_pokemonSummary_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_pokemonSummary_ts --> src_services_pokeapi_mapSummary_ts
    src_services_pokeapi_pokemonSummary_ts --> src_types_pokeapi_ts
    src_services_pokeapi_pokemonSummary_ts --> src_types_pokemon_ts
    src_services_pokeapi_speciesEvolutionHint_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_speciesEvolutionHint_ts --> src_types_pokeapi_ts
    src_services_pokeapi_typeEffectiveness_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_typeEffectiveness_ts --> src_types_pokeapi_ts
    src_services_pokeapi_typeEffectiveness_ts --> src_types_pokemon_ts
    src_services_pokeapi_typeMatchupChart_ts --> src_data_pokemonTypes_ts
    src_services_pokeapi_typeMatchupChart_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_typeMatchupChart_ts --> src_types_pokeapi_ts
    src_services_pokeapi_typePokemonIds_ts --> src_services_pokeapi_client_ts
    src_services_pokeapi_typePokemonIds_ts --> src_services_pokeapi_resourceIds_ts
    src_services_pokeapi_typePokemonIds_ts --> src_types_pokeapi_ts
    src_store_uiStore_ts --> src_data_pokeballs_ts
    src_store_uiStore_ts --> src_store_dexListsStore_ts
    src_types_pokemon_ts --> src_types_pokeapi_ts
    src_utils_evolutionTriggerSummary_test_ts --> src_utils_evolutionTriggerSummary_ts
    src_utils_evolutionTriggerSummary_ts --> src_types_pokeapi_ts
    src_utils_pokemonMeta_ts --> src_types_pokeapi_ts
    src_utils_typeGradients_ts --> src_types_pokemon_ts
    truncated["+ 78 additional nodes omitted"]
```
