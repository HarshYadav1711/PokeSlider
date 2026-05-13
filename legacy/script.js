// Poké Ball data with catch rates and descriptions
const pokeballData = [
    {
        name: 'Poke Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
        catchRate: '1x',
        description: 'A device for catching wild Pokémon. It is thrown like a ball at a Pokémon, comfortably encapsulating its target.',
        pokemonTypes: ['normal', 'flying', 'bug']
    },
    {
        name: 'Great Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
        catchRate: '1.5x',
        description: 'A good, high-performance Poké Ball that provides a higher success rate for catching Pokémon than a standard Poké Ball.',
        pokemonTypes: ['normal', 'flying', 'bug', 'water']
    },
    {
        name: 'Ultra Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
        catchRate: '2x',
        description: 'An ultra-high-performance Poké Ball that provides a higher success rate for catching Pokémon than a Great Ball.',
        pokemonTypes: ['normal', 'flying', 'bug', 'water', 'fire', 'electric']
    },
    {
        name: 'Master Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
        catchRate: '255x (100%)',
        description: 'The best Poké Ball with the ultimate level of performance. It will catch any wild Pokémon without fail.',
        pokemonTypes: ['legendary', 'mythical']
    },
    {
        name: 'Premier Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png',
        catchRate: '1x',
        description: 'A somewhat rare Poké Ball that was made as a commemorative item used to celebrate an event of some sort.',
        pokemonTypes: ['normal', 'flying']
    },
    {
        name: 'Net Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/net-ball.png',
        catchRate: '3x (Bug/Water)',
        description: 'A somewhat different Poké Ball that works especially well on Bug- and Water-type Pokémon.',
        pokemonTypes: ['bug', 'water']
    },
    {
        name: 'Dive Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dive-ball.png',
        catchRate: '3.5x (Water)',
        description: 'A somewhat different Poké Ball that works especially well on Pokémon that live underwater.',
        pokemonTypes: ['water']
    },
    {
        name: 'Nest Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png',
        catchRate: 'Up to 4x (lower level)',
        description: 'A somewhat different Poké Ball that works especially well on weaker Pokémon in the wild.',
        pokemonTypes: ['normal', 'bug', 'flying']
    },
    {
        name: 'Repeat Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png',
        catchRate: '3x (if already caught)',
        description: 'A somewhat different Poké Ball that works especially well on Pokémon species that were previously caught.',
        pokemonTypes: ['normal']
    },
    {
        name: 'Timer Ball',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
        catchRate: 'Up to 4x (after 10 turns)',
        description: 'A somewhat different Poké Ball that becomes progressively more effective the more turns that are taken in battle.',
        pokemonTypes: ['normal']
    }
];

class PokeballCarousel {
    constructor() {
        this.carousel = document.getElementById('carousel');
        this.overlay = document.getElementById('overlay');
        this.closeBtn = document.getElementById('closeBtn');
        this.backBtn = document.getElementById('backBtn');
        this.ballView = document.getElementById('ballView');
        this.pokemonView = document.getElementById('pokemonView');
        this.playCryBtn = document.getElementById('playCryBtn');
        this.currentPokemon = null; // Store current Pokémon for cry replay
        this.angle = 0;
        this.isDragging = false;
        this.startAngle = 0;
        this.startX = 0;
        this.autoRotateSpeed = 0.5;
        this.autoRotate = true;
        this.pokemonCache = {};
        this.detailedPokemonCache = {};
        this.typeEffectivenessCache = {};
        this.allPokemonData = null; // Will store all Pokémon with categories
        this.pokemonCategories = {
            legendary: [],
            mythical: [],
            pseudoLegendary: [],
            regular: []
        };
        this.currentCryAudio = null; // Track currently playing cry
        
        this.init();
    }
    
    async init() {
        this.createPokeballs();
        this.setupEventListeners();
        this.startAutoRotation();
        this.updateCarousel();
        // Load all Pokémon data in background
        this.loadAllPokemonData();
    }
    
    async loadAllPokemonData() {
        try {
            // Fetch all Pokémon from PokeAPI (currently supports up to ~1025 Pokémon)
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
            const data = await response.json();
            
            // Process all Pokémon to categorize them
            const pokemonPromises = data.results.map(async (pokemon, index) => {
                const id = index + 1;
                try {
                    // Fetch species data to determine legendary/mythical status
                    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
                    const speciesData = await speciesResponse.json();
                    
                    // Fetch Pokémon data for stats
                    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    const pokemonData = await pokemonResponse.json();
                    
                    // Calculate base stat total
                    const baseStatTotal = pokemonData.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
                    
                    // Determine category
                    const isLegendary = speciesData.is_legendary;
                    const isMythical = speciesData.is_mythical;
                    const isPseudoLegendary = this.isPseudoLegendary(pokemonData, speciesData, baseStatTotal);
                    
                    return {
                        id: id,
                        name: pokemonData.name,
                        sprite: pokemonData.sprites.front_default,
                        image: pokemonData.sprites.other['official-artwork']?.front_default || pokemonData.sprites.front_default,
                        types: pokemonData.types.map(t => t.type.name),
                        baseStatTotal: baseStatTotal,
                        isLegendary: isLegendary,
                        isMythical: isMythical,
                        isPseudoLegendary: isPseudoLegendary,
                        category: isLegendary ? 'legendary' : isMythical ? 'mythical' : isPseudoLegendary ? 'pseudoLegendary' : 'regular',
                        speciesUrl: speciesData.url,
                        pokemonUrl: pokemonData.url
                    };
                } catch (error) {
                    console.error(`Error loading Pokémon ${id}:`, error);
                    return null;
                }
            });
            
            const allPokemon = (await Promise.all(pokemonPromises)).filter(p => p !== null);
            
            // Categorize Pokémon
            this.pokemonCategories.legendary = allPokemon.filter(p => p.isLegendary && !p.isMythical);
            this.pokemonCategories.mythical = allPokemon.filter(p => p.isMythical);
            this.pokemonCategories.pseudoLegendary = allPokemon.filter(p => p.isPseudoLegendary);
            this.pokemonCategories.regular = allPokemon.filter(p => !p.isLegendary && !p.isMythical && !p.isPseudoLegendary);
            
            this.allPokemonData = allPokemon;
            console.log('Loaded all Pokémon:', {
                total: allPokemon.length,
                legendary: this.pokemonCategories.legendary.length,
                mythical: this.pokemonCategories.mythical.length,
                pseudoLegendary: this.pokemonCategories.pseudoLegendary.length,
                regular: this.pokemonCategories.regular.length
            });
        } catch (error) {
            console.error('Error loading all Pokémon data:', error);
        }
    }
    
    isPseudoLegendary(pokemonData, speciesData, baseStatTotal) {
        // Pseudo-legendary criteria:
        // 1. Base stat total of 600
        // 2. Three-stage evolution line (or two-stage with high BST)
        // 3. Not legendary or mythical
        
        if (baseStatTotal !== 600) return false;
        if (speciesData.is_legendary || speciesData.is_mythical) return false;
        
        // Known pseudo-legendaries (all have 600 BST, 3-stage evolutions, not legendary/mythical)
        const knownPseudoIds = [149, 248, 373, 376, 445, 635, 706, 784, 884];
        return knownPseudoIds.includes(pokemonData.id);
    }
    
    createPokeballs() {
        pokeballData.forEach((ball, index) => {
            const pokeball = document.createElement('div');
            pokeball.className = 'pokeball';
            pokeball.dataset.index = index;
            pokeball.dataset.ballName = ball.name;
            
            const img = document.createElement('img');
            // Use HD 3D sprites from better source
            img.src = ball.image;
            img.alt = ball.name;
            img.loading = 'lazy';
            img.onerror = () => {
                // Fallback to placeholder
                img.src = `https://via.placeholder.com/140/FF0000/FFFFFF?text=${ball.name.charAt(0)}`;
            };
            
            pokeball.appendChild(img);
            pokeball.addEventListener('click', () => this.showOverlay(ball));
            this.carousel.appendChild(pokeball);
        });
    }
    
    setupEventListeners() {
        // Mouse drag
        this.carousel.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch drag - improved for mobile
        this.carousel.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.startDrag(e.touches[0]);
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                e.preventDefault();
                this.drag(e.touches[0]);
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => this.endDrag());
        document.addEventListener('touchcancel', () => this.endDrag());
        
        // Close overlay
        this.closeBtn.addEventListener('click', () => this.hideOverlay());
        this.backBtn.addEventListener('click', () => this.showBallView());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hideOverlay();
            }
        });
        
        // Play cry button
        if (this.playCryBtn) {
            this.playCryBtn.addEventListener('click', () => {
                if (this.currentPokemon) {
                    this.playPokemonCry(this.currentPokemon);
                }
            });
        }
        
        // Pause auto-rotation on hover (desktop only)
        this.carousel.addEventListener('mouseenter', () => {
            this.autoRotate = false;
        });
        this.carousel.addEventListener('mouseleave', () => {
            this.autoRotate = true;
        });
        
        // Prevent zoom on double tap for mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.autoRotate = false;
        this.startX = e.clientX;
        this.startAngle = this.angle;
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.startX;
        // Adjust sensitivity for mobile (more responsive on touch)
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const sensitivity = isTouch ? 0.6 : 0.5;
        this.angle = this.startAngle + (deltaX * sensitivity);
        this.updateCarousel();
    }
    
    endDrag() {
        this.isDragging = false;
        setTimeout(() => {
            this.autoRotate = true;
        }, 2000);
    }
    
    updateCarousel() {
        const balls = this.carousel.querySelectorAll('.pokeball');
        const totalBalls = balls.length;
        const angleStep = 360 / totalBalls;
        // Adjust radius for mobile devices
        const isMobile = window.innerWidth <= 768;
        const radius = isMobile ? 180 : 250;
        
        balls.forEach((ball, index) => {
            const currentAngle = this.angle + (index * angleStep);
            const radian = (currentAngle * Math.PI) / 180;
            
            const x = Math.sin(radian) * radius;
            const z = Math.cos(radian) * radius;
            const rotateY = currentAngle;
            
            // Use will-change for better performance on mobile
            ball.style.willChange = 'transform';
            ball.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${-rotateY}deg)`;
            
            const normalizedAngle = ((currentAngle % 360) + 360) % 360;
            const distanceFromFront = Math.min(normalizedAngle, 360 - normalizedAngle);
            
            if (distanceFromFront < 20) {
                ball.classList.add('active');
            } else {
                ball.classList.remove('active');
            }
        });
    }
    
    startAutoRotation() {
        const rotate = () => {
            if (this.autoRotate && !this.isDragging) {
                this.angle += this.autoRotateSpeed;
                this.updateCarousel();
            }
            requestAnimationFrame(rotate);
        };
        rotate();
    }
    
    async showOverlay(ball) {
        document.getElementById('ballName').textContent = ball.name;
        document.getElementById('ballDescription').textContent = ball.description;
        document.getElementById('catchRate').textContent = ball.catchRate;
        
        const pokemonGrid = document.getElementById('pokemonGrid');
        pokemonGrid.innerHTML = '<div class="loading">Loading Pokémon...</div>';
        
        this.overlay.classList.add('active');
        
        await this.fetchPokemonForBall(ball);
    }
    
    async fetchPokemonForBall(ball) {
        const pokemonGrid = document.getElementById('pokemonGrid');
        pokemonGrid.innerHTML = '';
        
        try {
            let pokemonList = [];
            
            // Wait for data to load if not ready
            if (!this.allPokemonData) {
                pokemonGrid.innerHTML = '<div class="loading">Loading all Pokémon data... This may take a moment.</div>';
                await this.loadAllPokemonData();
            }
            
            if (ball.name === 'Master Ball') {
                // Master Ball: All legendaries and mythicals
                const allSpecial = [
                    ...this.pokemonCategories.legendary,
                    ...this.pokemonCategories.mythical
                ];
                const shuffled = allSpecial.sort(() => Math.random() - 0.5);
                pokemonList = shuffled.slice(0, 30);
            } else if (ball.name === 'Ultra Ball') {
                // Ultra Ball: Pseudo-legendaries, strong regular Pokémon, some legendaries
                const ultraMix = [
                    ...this.pokemonCategories.pseudoLegendary,
                    ...this.pokemonCategories.regular.filter(p => p.baseStatTotal >= 500).slice(0, 20),
                    ...this.pokemonCategories.legendary.slice(0, 5)
                ];
                const shuffled = ultraMix.sort(() => Math.random() - 0.5);
                pokemonList = shuffled.slice(0, 25);
            } else if (ball.name === 'Great Ball') {
                // Great Ball: Regular Pokémon and some pseudo-legendaries
                const greatMix = [
                    ...this.pokemonCategories.regular.filter(p => p.baseStatTotal >= 400 && p.baseStatTotal < 500).slice(0, 30),
                    ...this.pokemonCategories.pseudoLegendary.slice(0, 3)
                ];
                const shuffled = greatMix.sort(() => Math.random() - 0.5);
                pokemonList = shuffled.slice(0, 20);
            } else if (ball.name === 'Net Ball' || ball.name === 'Dive Ball') {
                // Type-specific: Filter by type from all Pokémon
                const typeFilter = ball.pokemonTypes;
                const typePokemon = this.allPokemonData.filter(p => 
                    p.types.some(type => typeFilter.includes(type))
                );
                const shuffled = typePokemon.sort(() => Math.random() - 0.5);
                pokemonList = shuffled.slice(0, 25);
            } else {
                // Other balls: Mix of type-based and regular Pokémon
                const typeFilter = ball.pokemonTypes;
                const typePokemon = this.allPokemonData.filter(p => 
                    p.types.some(type => typeFilter.includes(type))
                );
                const regularPokemon = this.pokemonCategories.regular.slice(0, 10);
                const shuffled = [...typePokemon, ...regularPokemon].sort(() => Math.random() - 0.5);
                pokemonList = shuffled.slice(0, 20);
            }
            
            // Display Pokémon with categories
            pokemonList.forEach(pokemon => {
                if (pokemon) {
                    const item = document.createElement('div');
                    item.className = 'pokemon-item';
                    item.dataset.pokemonId = pokemon.id;
                    item.dataset.pokemonName = pokemon.name;
                    
                    const img = document.createElement('img');
                    // Use HD official artwork or 3D sprites
                    img.src = pokemon.image || pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
                    img.alt = pokemon.name;
                    img.loading = 'lazy';
                    img.onerror = () => {
                        // Try alternative sprite source
                        img.src = pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png` || 'https://via.placeholder.com/100/CCCCCC/666666?text=?';
                    };
                    
                    const name = document.createElement('p');
                    name.textContent = pokemon.name;
                    
                    // Add category badge
                    const category = document.createElement('span');
                    category.className = 'pokemon-category';
                    if (pokemon.isLegendary) {
                        category.textContent = '★';
                        category.title = 'Legendary';
                        category.style.color = '#FFD700';
                    } else if (pokemon.isMythical) {
                        category.textContent = '✦';
                        category.title = 'Mythical';
                        category.style.color = '#FF69B4';
                    } else if (pokemon.isPseudoLegendary) {
                        category.textContent = '◆';
                        category.title = 'Pseudo-Legendary';
                        category.style.color = '#9370DB';
                    }
                    
                    item.appendChild(img);
                    item.appendChild(name);
                    if (category.textContent) {
                        item.appendChild(category);
                    }
                    
                    item.addEventListener('click', () => this.showPokemonDetails(pokemon.id || pokemon.name));
                    
                    pokemonGrid.appendChild(item);
                }
            });
            
            if (pokemonList.length === 0) {
                pokemonGrid.innerHTML = '<div class="loading">No Pokémon data available</div>';
            }
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
            pokemonGrid.innerHTML = '<div class="loading">Error loading Pokémon data</div>';
        }
    }
    
    async fetchPokemon(id) {
        if (this.pokemonCache[id]) {
            return this.pokemonCache[id];
        }
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await response.json();
            const pokemon = {
                id: data.id,
                name: data.name,
                sprite: data.sprites.front_default,
                // Prioritize HD official artwork, then home 3D sprites, then default
                image: data.sprites.other['official-artwork']?.front_default || 
                       data.sprites.other['home']?.front_default ||
                       data.sprites.front_default
            };
            this.pokemonCache[id] = pokemon;
            return pokemon;
        } catch (error) {
            console.error(`Error fetching Pokémon ${id}:`, error);
            return null;
        }
    }
    
    async fetchDetailedPokemon(id) {
        const cacheKey = typeof id === 'number' ? id : id.toLowerCase();
        if (this.detailedPokemonCache[cacheKey]) {
            return this.detailedPokemonCache[cacheKey];
        }
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await response.json();
            
            const speciesResponse = await fetch(data.species.url);
            const speciesData = await speciesResponse.json();
            
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResponse.json();
            
            // Fetch location/encounter data
            const locationAreas = await this.fetchPokemonLocations(id);
            
            // Fetch mega evolution forms
            const megaEvolutions = await this.fetchMegaEvolutions(data.id, data.name, speciesData);
            
            // Get Pokémon cry URL from PokeAPI (cries object contains latest and legacy)
            let cryUrl = null;
            if (data.cries) {
                cryUrl = data.cries.latest || data.cries.legacy || null;
            }
            
            const pokemon = {
                id: data.id,
                name: data.name,
                // Use HD official artwork or 3D home sprites
                image: data.sprites.other['official-artwork']?.front_default || 
                       data.sprites.other['home']?.front_default ||
                       data.sprites.front_default,
                types: data.types.map(t => t.type.name),
                stats: data.stats.map(s => ({
                    name: s.stat.name.replace('-', ' '),
                    value: s.base_stat
                })),
                baseStatTotal: data.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
                pokedexEntries: speciesData.flavor_text_entries
                    .filter(entry => entry.language.name === 'en')
                    .map(entry => entry.flavor_text.replace(/\f/g, ' ')),
                evolutionChainUrl: speciesData.evolution_chain.url,
                evolutionData: evolutionData,
                isLegendary: speciesData.is_legendary,
                isMythical: speciesData.is_mythical,
                isPseudoLegendary: this.isPseudoLegendary(data, speciesData, data.stats.reduce((sum, stat) => sum + stat.base_stat, 0)),
                locations: locationAreas,
                generation: this.getGeneration(data.id),
                habitat: speciesData.habitat?.name || 'Unknown',
                megaEvolutions: megaEvolutions,
                cryUrl: cryUrl || this.getPokemonCryUrl(data.id)
            };
            
            this.detailedPokemonCache[cacheKey] = pokemon;
            return pokemon;
        } catch (error) {
            console.error(`Error fetching detailed Pokémon ${id}:`, error);
            return null;
        }
    }
    
    async fetchMegaEvolutions(baseId, baseName, speciesData) {
        try {
            const megaForms = [];
            
            // First, try to fetch by known mega evolution form names
            const knownMegaForms = this.getKnownMegaFormNames(baseId, baseName);
            
            for (const formName of knownMegaForms) {
                try {
                    const formResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${formName}`);
                    const formData = await formResponse.json();
                    
                    const formNameLower = formData.name.toLowerCase();
                    if (formNameLower.includes('mega')) {
                        const megaStoneName = this.getMegaStoneName(formNameLower, baseName);
                        
                        megaForms.push({
                            id: formData.id,
                            name: formData.name,
                            formName: formData.forms[0]?.name || formData.name,
                            image: formData.sprites.other['official-artwork']?.front_default || formData.sprites.front_default,
                            types: formData.types.map(t => t.type.name),
                            stats: formData.stats.map(s => ({
                                name: s.stat.name.replace('-', ' '),
                                value: s.base_stat
                            })),
                            baseStatTotal: formData.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
                            megaStone: megaStoneName,
                            isMega: true
                        });
                    }
                } catch (error) {
                    // Try alternative form name
                    try {
                        const altFormName = formName.replace('-', '');
                        const formResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${altFormName}`);
                        const formData = await formResponse.json();
                        
                        const formNameLower = formData.name.toLowerCase();
                        if (formNameLower.includes('mega')) {
                            const megaStoneName = this.getMegaStoneName(formNameLower, baseName);
                            
                            megaForms.push({
                                id: formData.id,
                                name: formData.name,
                                formName: formData.forms[0]?.name || formData.name,
                                image: formData.sprites.other['official-artwork']?.front_default || formData.sprites.front_default,
                                types: formData.types.map(t => t.type.name),
                                stats: formData.stats.map(s => ({
                                    name: s.stat.name.replace('-', ' '),
                                    value: s.base_stat
                                })),
                                baseStatTotal: formData.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
                                megaStone: megaStoneName,
                                isMega: true
                            });
                        }
                    } catch (altError) {
                        // Skip if form doesn't exist
                    }
                }
            }
            
            // Also check varieties from species data
            if (megaForms.length === 0) {
                for (const variety of speciesData.varieties || []) {
                    if (variety.is_default) continue;
                    
                    try {
                        const formResponse = await fetch(variety.pokemon.url);
                        const formData = await formResponse.json();
                        
                        const formName = formData.name.toLowerCase();
                        if (formName.includes('mega')) {
                            const megaStoneName = this.getMegaStoneName(formName, baseName);
                            
                            megaForms.push({
                                id: formData.id,
                                name: formData.name,
                                formName: formData.forms[0]?.name || formData.name,
                                image: formData.sprites.other['official-artwork']?.front_default || formData.sprites.front_default,
                                types: formData.types.map(t => t.type.name),
                                stats: formData.stats.map(s => ({
                                    name: s.stat.name.replace('-', ' '),
                                    value: s.base_stat
                                })),
                                baseStatTotal: formData.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
                                megaStone: megaStoneName,
                                isMega: true
                            });
                        }
                    } catch (error) {
                        // Continue to next variety
                    }
                }
            }
            
            return megaForms;
        } catch (error) {
            console.error(`Error fetching mega evolutions for ${baseName}:`, error);
            return [];
        }
    }
    
    getKnownMegaFormNames(baseId, baseName) {
        // Map of base Pokémon IDs to their mega form names in PokeAPI
        const megaFormMap = {
            3: ['venusaur-mega'], // Venusaur
            6: ['charizard-mega-x', 'charizard-mega-y'], // Charizard
            9: ['blastoise-mega'], // Blastoise
            15: ['beedrill-mega'], // Beedrill
            18: ['pidgeot-mega'], // Pidgeot
            65: ['alakazam-mega'], // Alakazam
            80: ['slowbro-mega'], // Slowbro
            94: ['gengar-mega'], // Gengar
            115: ['kangaskhan-mega'], // Kangaskhan
            127: ['pinsir-mega'], // Pinsir
            130: ['gyarados-mega'], // Gyarados
            142: ['aerodactyl-mega'], // Aerodactyl
            150: ['mewtwo-mega-x', 'mewtwo-mega-y'], // Mewtwo
            181: ['ampharos-mega'], // Ampharos
            208: ['steelix-mega'], // Steelix
            212: ['scizor-mega'], // Scizor
            229: ['houndoom-mega'], // Houndoom
            248: ['tyranitar-mega'], // Tyranitar
            254: ['sceptile-mega'], // Sceptile
            257: ['blaziken-mega'], // Blaziken
            260: ['swampert-mega'], // Swampert
            282: ['gardevoir-mega'], // Gardevoir
            303: ['mawile-mega'], // Mawile
            306: ['aggron-mega'], // Aggron
            308: ['medicham-mega'], // Medicham
            310: ['manectric-mega'], // Manectric
            319: ['sharpedo-mega'], // Sharpedo
            323: ['camerupt-mega'], // Camerupt
            334: ['altaria-mega'], // Altaria
            354: ['banette-mega'], // Banette
            359: ['absol-mega'], // Absol
            362: ['glalie-mega'], // Glalie
            373: ['salamence-mega'], // Salamence
            376: ['metagross-mega'], // Metagross
            380: ['latias-mega'], // Latias
            381: ['latios-mega'], // Latios
            384: ['rayquaza-mega'], // Rayquaza (uses Dragon Ascent, no stone)
            445: ['garchomp-mega'], // Garchomp
            448: ['lucario-mega'], // Lucario
            460: ['abomasnow-mega'], // Abomasnow
        };
        
        return megaFormMap[baseId] || [];
    }
    
    getMegaStoneName(formName, baseName) {
        // Convert form name to mega stone name
        // e.g., "mega-charizard-x" -> "Charizardite X"
        const base = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        
        // Special cases
        const specialCases = {
            'mewtwo-mega-x': 'Mewtwonite X',
            'mewtwo-mega-y': 'Mewtwonite Y',
            'charizard-mega-x': 'Charizardite X',
            'charizard-mega-y': 'Charizardite Y',
            'rayquaza-mega': 'Rayquazite (Dragon Ascent)',
            'venusaur-mega': 'Venusaurite',
            'blastoise-mega': 'Blastoisinite',
            'beedrill-mega': 'Beedrillite',
            'pidgeot-mega': 'Pidgeotite',
            'alakazam-mega': 'Alakazite',
            'slowbro-mega': 'Slowbronite',
            'gengar-mega': 'Gengarite',
            'kangaskhan-mega': 'Kangaskhanite',
            'pinsir-mega': 'Pinsirite',
            'gyarados-mega': 'Gyaradosite',
            'aerodactyl-mega': 'Aerodactylite',
            'ampharos-mega': 'Ampharosite',
            'steelix-mega': 'Steelixite',
            'scizor-mega': 'Scizorite',
            'houndoom-mega': 'Houndoominite',
            'tyranitar-mega': 'Tyranitarite',
            'sceptile-mega': 'Sceptilite',
            'blaziken-mega': 'Blazikenite',
            'swampert-mega': 'Swampertite',
            'gardevoir-mega': 'Gardevoirite',
            'mawile-mega': 'Mawilite',
            'aggron-mega': 'Aggronite',
            'medicham-mega': 'Medichamite',
            'manectric-mega': 'Manectite',
            'sharpedo-mega': 'Sharpedonite',
            'camerupt-mega': 'Cameruptite',
            'altaria-mega': 'Altarianite',
            'banette-mega': 'Banettite',
            'absol-mega': 'Absolite',
            'glalie-mega': 'Glalitite',
            'salamence-mega': 'Salamencite',
            'metagross-mega': 'Metagrossite',
            'latias-mega': 'Latiasite',
            'latios-mega': 'Latiosite',
            'garchomp-mega': 'Garchompite',
            'lucario-mega': 'Lucarionite',
            'abomasnow-mega': 'Abomasnowite'
        };
        
        if (specialCases[formName]) {
            return specialCases[formName];
        }
        
        if (formName.includes('-x')) {
            return `${base}ite X`;
        } else if (formName.includes('-y')) {
            return `${base}ite Y`;
        } else {
            // Remove "mega-" prefix and capitalize
            const cleanName = formName.replace('mega-', '').replace(/-/g, ' ');
            const words = cleanName.split(' ');
            const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${capitalized}ite`;
        }
    }
    
    
    async fetchPokemonLocations(pokemonId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
            const data = await response.json();
            
            const locations = [];
            data.forEach(encounter => {
                encounter.version_details.forEach(versionDetail => {
                    versionDetail.encounter_details.forEach(detail => {
                        locations.push({
                            location: encounter.location_area.name.replace(/-/g, ' '),
                            game: versionDetail.version.name,
                            method: detail.method.name.replace(/-/g, ' '),
                            chance: detail.chance,
                            minLevel: detail.min_level,
                            maxLevel: detail.max_level
                        });
                    });
                });
            });
            
            return locations;
        } catch (error) {
            console.error(`Error fetching locations for Pokémon ${pokemonId}:`, error);
            return [];
        }
    }
    
    getGeneration(pokemonId) {
        if (pokemonId <= 151) return 1;
        if (pokemonId <= 251) return 2;
        if (pokemonId <= 386) return 3;
        if (pokemonId <= 493) return 4;
        if (pokemonId <= 649) return 5;
        if (pokemonId <= 721) return 6;
        if (pokemonId <= 809) return 7;
        if (pokemonId <= 905) return 8;
        return 9;
    }
    
    getPokemonCryUrl(pokemonId) {
        // Primary source: PokeAPI cries repository (OGG format, high quality)
        // This is the official source used by PokeAPI
        return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/${pokemonId}.ogg`;
    }
    
    async playPokemonCry(pokemon) {
        try {
            // Stop any currently playing cry
            if (this.currentCryAudio) {
                this.currentCryAudio.pause();
                this.currentCryAudio = null;
            }
            
            // Update button state
            if (this.playCryBtn) {
                this.playCryBtn.classList.add('playing');
                this.playCryBtn.textContent = '🔊 Playing...';
            }
            
            // Get cry URL
            let cryUrl = pokemon.cryUrl;
            
            if (!cryUrl) {
                // Try to get from PokeAPI directly
                cryUrl = this.getPokemonCryUrl(pokemon.id);
            }
            
            // Create audio element
            const audio = new Audio();
            audio.volume = 0.7; // Set volume to 70% for comfortable listening
            
            // List of cry sources to try (in order of preference)
            // These are accurate cries from mainline games
            const crySources = [
                cryUrl, // From PokeAPI if available
                `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/${pokemon.id}.ogg`, // Official PokeAPI cries (mainline games)
                `https://veekun.com/dex/media/pokemon/cries/${pokemon.id}.ogg`, // Veekun database (Gen 1-5)
                `https://play.pokemonshowdown.com/audio/cries/${pokemon.id}.ogg`, // Pokemon Showdown (all gens)
                // Alternative formats
                `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/${pokemon.id}.wav`,
                // TV series voices (if available) - these would need a separate API
                `https://www.pokemon.com/us/pokemon-tv/pokemon-cries/${pokemon.id}.mp3`
            ].filter(url => url); // Remove null/undefined
            
            let sourceIndex = 0;
            
            const tryPlay = () => {
                if (sourceIndex >= crySources.length) {
                    console.log('Could not load cry for', pokemon.name);
                    if (this.playCryBtn) {
                        this.playCryBtn.classList.remove('playing');
                        this.playCryBtn.textContent = '🔇 Cry Unavailable';
                        setTimeout(() => {
                            if (this.playCryBtn) {
                                this.playCryBtn.textContent = '🔊 Play Cry';
                            }
                        }, 2000);
                    }
                    return;
                }
                
                audio.src = crySources[sourceIndex];
                sourceIndex++;
                
                // Try to play
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            this.currentCryAudio = audio;
                            console.log('Playing cry for', pokemon.name);
                            
                            // Update button when audio ends
                            audio.addEventListener('ended', () => {
                                if (this.playCryBtn) {
                                    this.playCryBtn.classList.remove('playing');
                                    this.playCryBtn.textContent = '🔊 Play Cry';
                                }
                                this.currentCryAudio = null;
                            }, { once: true });
                        })
                        .catch(error => {
                            // Try next source
                            tryPlay();
                        });
                }
            };
            
            // Handle load error - try next source
            audio.addEventListener('error', () => {
                tryPlay();
            }, { once: true });
            
            // Start trying to play
            tryPlay();
            
        } catch (error) {
            console.error('Error playing Pokémon cry:', error);
            if (this.playCryBtn) {
                this.playCryBtn.classList.remove('playing');
                this.playCryBtn.textContent = '🔊 Play Cry';
            }
        }
    }
    
    async getTypeEffectiveness(types) {
        const cacheKey = types.sort().join(',');
        if (this.typeEffectivenessCache[cacheKey]) {
            return this.typeEffectivenessCache[cacheKey];
        }
        
        try {
            const typePromises = types.map(type => 
                fetch(`https://pokeapi.co/api/v2/type/${type}`).then(r => r.json())
            );
            const typeData = await Promise.all(typePromises);
            
            const effectiveness = {};
            const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 
                            'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
                            'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
            
            allTypes.forEach(attackType => {
                let multiplier = 1;
                typeData.forEach(typeInfo => {
                    const damageRelation = typeInfo.damage_relations;
                    
                    if (damageRelation.double_damage_from.some(t => t.name === attackType)) {
                        multiplier *= 2;
                    }
                    else if (damageRelation.half_damage_from.some(t => t.name === attackType)) {
                        multiplier *= 0.5;
                    }
                    if (damageRelation.no_damage_from.some(t => t.name === attackType)) {
                        multiplier *= 0;
                    }
                });
                
                effectiveness[attackType] = multiplier;
            });
            
            const result = {
                superEffective: Object.entries(effectiveness)
                    .filter(([_, mult]) => mult > 1)
                    .map(([type, _]) => type),
                notVeryEffective: Object.entries(effectiveness)
                    .filter(([_, mult]) => mult > 0 && mult < 1)
                    .map(([type, _]) => type),
                noEffect: Object.entries(effectiveness)
                    .filter(([_, mult]) => mult === 0)
                    .map(([type, _]) => type)
            };
            
            this.typeEffectivenessCache[cacheKey] = result;
            return result;
        } catch (error) {
            console.error('Error fetching type effectiveness:', error);
            return { superEffective: [], notVeryEffective: [], noEffect: [] };
        }
    }
    
    async buildEvolutionChain(evolutionData, currentPokemonId) {
        const chain = [];
        
        const traverseChain = (chainLink, level = 0) => {
            const pokemonName = chainLink.species.name;
            const evolutionDetails = chainLink.evolution_details || [];
            
            chain.push({
                name: pokemonName,
                level: level,
                details: evolutionDetails[0] || null
            });
            
            if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
                chainLink.evolves_to.forEach(nextLink => {
                    traverseChain(nextLink, level + 1);
                });
            }
        };
        
        traverseChain(evolutionData.chain);
        
        const pokemonPromises = chain.map(async (item) => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${item.name}`);
                const data = await response.json();
                return {
                    id: data.id,
                    name: data.name,
                    image: data.sprites.other['official-artwork']?.front_default || data.sprites.front_default,
                    level: item.level,
                    details: item.details
                };
            } catch (error) {
                return null;
            }
        });
        
        const pokemonChain = (await Promise.all(pokemonPromises)).filter(p => p !== null);
        return pokemonChain;
    }
    
    async showPokemonDetails(id) {
        const pokemonGrid = document.getElementById('pokemonGrid');
        pokemonGrid.innerHTML = '<div class="loading">Loading Pokémon details...</div>';
        
        const pokemon = await this.fetchDetailedPokemon(id);
        if (!pokemon) {
            pokemonGrid.innerHTML = '<div class="loading">Error loading Pokémon details</div>';
            return;
        }
        
        this.ballView.classList.add('hidden');
        this.pokemonView.classList.remove('hidden');
        this.backBtn.classList.remove('hidden');
        
        // Store current Pokémon for cry replay
        this.currentPokemon = pokemon;
        
        // Play Pokémon cry automatically
        await this.playPokemonCry(pokemon);
        
        document.getElementById('pokemonName').textContent = pokemon.name;
        document.getElementById('pokemonId').textContent = String(pokemon.id).padStart(3, '0');
        document.getElementById('pokemonImage').src = pokemon.image;
        document.getElementById('pokemonImage').alt = pokemon.name;
        
        const typesContainer = document.getElementById('pokemonTypes');
        typesContainer.innerHTML = '';
        pokemon.types.forEach(type => {
            const badge = document.createElement('span');
            badge.className = `type-badge type-${type}`;
            badge.textContent = type;
            typesContainer.appendChild(badge);
        });
        
        const pokedexDesc = document.getElementById('pokedexDescription');
        pokedexDesc.textContent = pokemon.pokedexEntries[0] || 'No description available.';
        
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = '';
        pokemon.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            const statName = document.createElement('div');
            statName.className = 'stat-name';
            statName.textContent = stat.name;
            
            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.textContent = stat.value;
            
            statItem.appendChild(statName);
            statItem.appendChild(statValue);
            statsGrid.appendChild(statItem);
        });
        
        // Add total stat
        const totalItem = document.createElement('div');
        totalItem.className = 'stat-item';
        totalItem.innerHTML = '<div class="stat-name">Total</div><div class="stat-value">' + pokemon.baseStatTotal + '</div>';
        statsGrid.appendChild(totalItem);
        
        // Add category info
        const pokemonTitle = document.getElementById('pokemonName').parentElement;
        // Remove existing category info if any
        const existingInfo = pokemonTitle.querySelector('.pokemon-category-info');
        if (existingInfo) existingInfo.remove();
        
        const categoryInfo = document.createElement('div');
        categoryInfo.className = 'pokemon-category-info';
        const categories = [];
        if (pokemon.isLegendary) categories.push('Legendary');
        if (pokemon.isMythical) categories.push('Mythical');
        if (pokemon.isPseudoLegendary) categories.push('Pseudo-Legendary');
        if (categories.length === 0) categories.push('Regular');
        categoryInfo.innerHTML = `<strong>Category:</strong> ${categories.join(', ')} | <strong>Generation:</strong> ${pokemon.generation} | <strong>Habitat:</strong> ${pokemon.habitat}`;
        pokemonTitle.appendChild(categoryInfo);
        
        const evolutionChain = await this.buildEvolutionChain(pokemon.evolutionData, pokemon.id);
        const evolutionContainer = document.getElementById('evolutionChain');
        evolutionContainer.innerHTML = '';
        
        // Check if this Pokémon has mega evolutions
        const hasMega = pokemon.megaEvolutions && pokemon.megaEvolutions.length > 0;
        
        if (evolutionChain.length === 1 && !hasMega) {
            evolutionContainer.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">This Pokémon does not evolve.</p>';
        } else {
            const chainDiv = document.createElement('div');
            chainDiv.className = 'evolution-chain';
            
            // Display regular evolution chain
            evolutionChain.forEach((evo, index) => {
                const stage = document.createElement('div');
                stage.className = 'evolution-stage';
                
                const pokemonDiv = document.createElement('div');
                pokemonDiv.className = 'evolution-pokemon';
                if (evo.id === pokemon.id) {
                    pokemonDiv.classList.add('current');
                }
                
                const img = document.createElement('img');
                img.src = evo.image;
                img.alt = evo.name;
                
                const name = document.createElement('p');
                name.textContent = evo.name;
                
                pokemonDiv.appendChild(img);
                pokemonDiv.appendChild(name);
                
                if (evo.details && index > 0) {
                    const condition = document.createElement('div');
                    condition.className = 'evolution-condition';
                    const conditions = [];
                    if (evo.details.min_level) conditions.push(`Level ${evo.details.min_level}`);
                    if (evo.details.item) conditions.push(evo.details.item.name.replace(/-/g, ' '));
                    if (evo.details.trigger && evo.details.trigger.name !== 'level-up') {
                        conditions.push(evo.details.trigger.name.replace(/-/g, ' '));
                    }
                    condition.textContent = conditions.join(' • ') || 'Evolves';
                    pokemonDiv.appendChild(condition);
                }
                
                pokemonDiv.addEventListener('click', () => {
                    this.showPokemonDetails(evo.id);
                });
                
                stage.appendChild(pokemonDiv);
                
                if (index < evolutionChain.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'evolution-arrow';
                    arrow.textContent = '→';
                    stage.appendChild(arrow);
                }
                
                chainDiv.appendChild(stage);
            });
            
            // Display mega evolutions if available
            if (hasMega) {
                // Check if current Pokémon is the base for mega evolution
                // Mega evolutions are always for the final evolution stage
                const finalEvo = evolutionChain[evolutionChain.length - 1];
                const canMegaEvolve = finalEvo.id === pokemon.id;
                
                if (canMegaEvolve) {
                    const megaSection = document.createElement('div');
                    megaSection.className = 'mega-evolution-section';
                    megaSection.innerHTML = '<h4 style="margin: 1.5rem 0 1rem 0; color: #FFD700; text-align: center;">Mega Evolutions</h4>';
                    
                    const megaContainer = document.createElement('div');
                    megaContainer.className = 'mega-evolution-container';
                    
                    pokemon.megaEvolutions.forEach((mega, index) => {
                        const megaStage = document.createElement('div');
                        megaStage.className = 'evolution-stage';
                        
                        const megaDiv = document.createElement('div');
                        megaDiv.className = 'evolution-pokemon mega-pokemon';
                        if (mega.id === pokemon.id) {
                            megaDiv.classList.add('current');
                        }
                        
                        const img = document.createElement('img');
                        img.src = mega.image;
                        img.alt = mega.name;
                        
                        const name = document.createElement('p');
                        name.textContent = mega.name.replace(/-/g, ' ').replace('mega', 'Mega');
                        name.style.fontWeight = 'bold';
                        
                        const megaBadge = document.createElement('div');
                        megaBadge.className = 'mega-badge';
                        megaBadge.textContent = 'MEGA';
                        
                        const condition = document.createElement('div');
                        condition.className = 'evolution-condition mega-condition';
                        condition.innerHTML = `<strong>Requires:</strong> ${mega.megaStone || 'Mega Stone'}<br><strong>BST:</strong> ${mega.baseStatTotal}`;
                        
                        megaDiv.appendChild(megaBadge);
                        megaDiv.appendChild(img);
                        megaDiv.appendChild(name);
                        megaDiv.appendChild(condition);
                        
                        // Show mega stats on click
                        megaDiv.addEventListener('click', () => {
                            this.showMegaDetails(mega, pokemon);
                        });
                        
                        megaStage.appendChild(megaDiv);
                        megaContainer.appendChild(megaStage);
                    });
                    
                    megaSection.appendChild(megaContainer);
                    chainDiv.appendChild(megaSection);
                }
            }
            
            evolutionContainer.appendChild(chainDiv);
        }
        
        // Display locations
        const locationsSection = document.createElement('div');
        locationsSection.className = 'pokemon-locations';
        locationsSection.innerHTML = '<h3>Location & Encounters</h3>';
        
        if (pokemon.locations.length === 0) {
            locationsSection.innerHTML += '<p style="color: rgba(255,255,255,0.7);">Location data not available for this Pokémon.</p>';
        } else {
            const locationGroups = {};
            pokemon.locations.forEach(loc => {
                const key = `${loc.game}-${loc.location}`;
                if (!locationGroups[key]) {
                    locationGroups[key] = {
                        game: loc.game,
                        location: loc.location,
                        encounters: []
                    };
                }
                locationGroups[key].encounters.push(loc);
            });
            
            Object.values(locationGroups).forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'location-group';
                groupDiv.innerHTML = `
                    <strong>${group.game.replace(/-/g, ' ').toUpperCase()}</strong> - ${group.location}<br>
                    ${group.encounters.map(e => `${e.method} (Lv. ${e.minLevel}-${e.maxLevel})`).join(', ')}
                `;
                locationsSection.appendChild(groupDiv);
            });
        }
        
        // Insert locations before type matchups (remove existing if any)
        const typeMatchups = document.querySelector('.type-matchups');
        const existingLocations = typeMatchups.parentElement.querySelector('.pokemon-locations');
        if (existingLocations) existingLocations.remove();
        typeMatchups.parentElement.insertBefore(locationsSection, typeMatchups);
        
        const effectiveness = await this.getTypeEffectiveness(pokemon.types);
        
        const superEffective = document.getElementById('superEffective');
        superEffective.innerHTML = '';
        if (effectiveness.superEffective.length === 0) {
            superEffective.innerHTML = '<span style="color: rgba(255,255,255,0.6);">None</span>';
        } else {
            effectiveness.superEffective.forEach(type => {
                const badge = document.createElement('span');
                badge.className = `type-badge type-${type}`;
                badge.textContent = type;
                superEffective.appendChild(badge);
            });
        }
        
        const notVeryEffective = document.getElementById('notVeryEffective');
        notVeryEffective.innerHTML = '';
        if (effectiveness.notVeryEffective.length === 0) {
            notVeryEffective.innerHTML = '<span style="color: rgba(255,255,255,0.6);">None</span>';
        } else {
            effectiveness.notVeryEffective.forEach(type => {
                const badge = document.createElement('span');
                badge.className = `type-badge type-${type}`;
                badge.textContent = type;
                notVeryEffective.appendChild(badge);
            });
        }
        
        const noEffect = document.getElementById('noEffect');
        noEffect.innerHTML = '';
        if (effectiveness.noEffect.length === 0) {
            noEffect.innerHTML = '<span style="color: rgba(255,255,255,0.6);">None</span>';
        } else {
            effectiveness.noEffect.forEach(type => {
                const badge = document.createElement('span');
                badge.className = `type-badge type-${type}`;
                badge.textContent = type;
                noEffect.appendChild(badge);
            });
        }
    }
    
    showMegaDetails(mega, basePokemon) {
        // Create a modal or update the view to show mega evolution details
        const megaDetails = `
            <div class="mega-details-overlay">
                <div class="mega-details-content">
                    <h3>${mega.name.replace(/-/g, ' ').replace('mega', 'Mega')}</h3>
                    <div class="mega-stats-comparison">
                        <div class="stat-comparison">
                            <h4>Base Stats Comparison</h4>
                            <div class="stats-comparison-grid">
                                ${mega.stats.map((stat, idx) => {
                                    const baseStat = basePokemon.stats[idx]?.value || 0;
                                    const diff = stat.value - baseStat;
                                    const diffClass = diff > 0 ? 'stat-increase' : diff < 0 ? 'stat-decrease' : '';
                                    return `
                                        <div class="stat-comparison-item">
                                            <div class="stat-name">${stat.name}</div>
                                            <div class="stat-values">
                                                <span class="base-stat">${baseStat}</span>
                                                <span class="arrow">→</span>
                                                <span class="mega-stat ${diffClass}">${stat.value}</span>
                                                ${diff !== 0 ? `<span class="stat-diff ${diffClass}">(${diff > 0 ? '+' : ''}${diff})</span>` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                                <div class="stat-comparison-item total">
                                    <div class="stat-name"><strong>Total</strong></div>
                                    <div class="stat-values">
                                        <span class="base-stat">${basePokemon.baseStatTotal}</span>
                                        <span class="arrow">→</span>
                                        <span class="mega-stat">${mega.baseStatTotal}</span>
                                        <span class="stat-diff">(+${mega.baseStatTotal - basePokemon.baseStatTotal})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mega-types">
                            <h4>Type</h4>
                            <div class="type-badges">
                                ${mega.types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                            </div>
                        </div>
                        <div class="mega-requirement">
                            <h4>Mega Evolution Requirement</h4>
                            <p><strong>Mega Stone:</strong> ${mega.megaStone || 'Unknown'}</p>
                            <p class="mega-note">Hold the Mega Stone and use it during battle to Mega Evolve!</p>
                        </div>
                    </div>
                    <button class="close-mega-btn" onclick="this.closest('.mega-details-overlay').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', megaDetails);
    }
    
    showBallView() {
        this.pokemonView.classList.add('hidden');
        this.ballView.classList.remove('hidden');
        this.backBtn.classList.add('hidden');
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PokeballCarousel();
});
