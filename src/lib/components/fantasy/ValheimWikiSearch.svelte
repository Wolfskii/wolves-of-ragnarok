<script lang="ts">
	type WikiResult = {
		title: string;
		excerpt: string;
		content: string;
		imageUrl: string | null;
		url: string;
	};

	let query = $state('');
	let results = $state<WikiResult[]>([]);
	let selectedResult = $state<WikiResult | null>(null);
	let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	let errorMessage = $state('');
	let debounceTimer: number | undefined;
	let requestId = 0;

	async function searchWiki(term = query.trim()) {
		if (term.length < 2) {
			status = 'error';
			errorMessage = 'Search for at least two characters.';
			return;
		}

		if (debounceTimer) window.clearTimeout(debounceTimer);
		const currentRequest = ++requestId;
		status = 'loading';
		errorMessage = '';
		selectedResult = null;
		try {
			const response = await fetch(`/api/wiki/search?q=${encodeURIComponent(term)}`);
			const data = (await response.json()) as { results?: WikiResult[]; error?: string };
			if (currentRequest !== requestId) return;
			if (!response.ok) throw new Error(data.error ?? 'The wiki search failed.');
			results = data.results ?? [];
			status = 'ready';
		} catch (error) {
			if (currentRequest !== requestId) return;
			status = 'error';
			errorMessage = error instanceof Error ? error.message : 'The wiki search failed.';
		}
	}

	function handleInput() {
		const term = query.trim();
		if (debounceTimer) window.clearTimeout(debounceTimer);
		selectedResult = null;
		if (term.length < 2) {
			requestId += 1;
			results = [];
			status = 'idle';
			return;
		}
		status = 'loading';
		debounceTimer = window.setTimeout(() => void searchWiki(term), 1000);
	}

	function useSuggestion(term: string) {
		query = term;
		handleInput();
	}
</script>

<section class="wiki-search" aria-labelledby="wiki-search-heading">
	<div class="search-intro">
		<p class="section-kicker">Valheim Wiki // Field guide</p>
		<h2 id="wiki-search-heading">Search the Valheim Wiki</h2>
		<p>
			Search items, creatures, biomes, crafting stations, and survival systems without leaving the
			hall.
		</p>
	</div>

	<form
		class="search-form"
		onsubmit={(event) => {
			event.preventDefault();
			void searchWiki();
		}}
	>
		<label for="wiki-query">Search the Valheim Wiki</label>
		<div class="search-row">
			<input
				id="wiki-query"
				bind:value={query}
				type="search"
				placeholder="Try iron, portal, Mistlands..."
				autocomplete="off"
				oninput={handleInput}
			/>
			<button type="submit" disabled={status === 'loading'}
				>{status === 'loading' ? 'Searching...' : 'Search'}</button
			>
		</div>
		<div class="suggestions" aria-label="Suggested searches">
			<span>Try:</span>
			{#each ['Iron', 'Portal', 'Mistlands', 'Eitr'] as suggestion (suggestion)}
				<button type="button" onclick={() => useSuggestion(suggestion)}>{suggestion}</button>
			{/each}
		</div>
	</form>

	{#if status === 'error'}
		<p class="search-message error" role="alert">{errorMessage}</p>
	{:else if status === 'loading'}
		<p class="search-message" role="status">Searching the field guide...</p>
	{:else if status === 'ready' && results.length === 0}
		<p class="search-message" role="status">No Valheim Wiki entries matched “{query}”.</p>
	{:else if results.length}
		<div class="results" aria-live="polite">
			{#each results as result (result.url)}
				<article class="result-card" class:selected={selectedResult?.url === result.url}>
					{#if result.imageUrl}<img src={result.imageUrl} alt="" loading="lazy" />{/if}
					<div class="result-copy">
						<p class="result-type">Valheim Wiki entry</p>
						<h3>{result.title}</h3>
						<p>{result.excerpt}{result.excerpt.length >= 520 ? '...' : ''}</p>
						<button class="read-result" type="button" onclick={() => (selectedResult = result)}
							>Read in the hall</button
						>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={result.url} target="_blank" rel="noreferrer"
							>Open full article <span aria-hidden="true">↗</span></a
						>
					</div>
				</article>
			{/each}
		</div>
	{/if}

	{#if selectedResult}
		<article class="selected-result" aria-live="polite">
			<div class="selected-result-heading">
				<div>
					<p class="result-type">Valheim Wiki entry</p>
					<h2>{selectedResult.title}</h2>
				</div>
				{#if selectedResult.imageUrl}<img
						src={selectedResult.imageUrl}
						alt=""
						loading="lazy"
					/>{/if}
			</div>
			<p class="selected-content">{selectedResult.content}</p>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={selectedResult.url} target="_blank" rel="noreferrer">Open source article ↗</a>
		</article>
	{/if}
</section>

<style>
	.wiki-search {
		margin-top: 2rem;
		padding: clamp(1.25rem, 4vw, 2.5rem);
		border: 1px solid rgba(137, 115, 69, 0.5);
		background:
			linear-gradient(120deg, rgba(168, 59, 67, 0.1), transparent 38%), rgba(3, 7, 8, 0.74);
		box-shadow: inset 0 0 28px rgba(197, 174, 112, 0.05);
	}

	.search-intro h2 {
		margin: 0.3rem 0 0.65rem;
		color: var(--frost-100);
		font-size: clamp(1.7rem, 4vw, 3rem);
		text-transform: uppercase;
	}
	.search-intro > p:last-child {
		max-width: 58ch;
		margin: 0;
		color: var(--text-muted);
		font-size: 0.8rem;
	}
	.search-form {
		margin-top: 1.6rem;
	}
	.search-form label {
		display: block;
		margin-bottom: 0.4rem;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.search-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.5rem;
	}
	.search-row input {
		min-width: 0;
		min-height: 3rem;
		padding: 0 0.9rem;
		border: 1px solid rgba(184, 197, 198, 0.28);
		background: rgba(0, 0, 0, 0.45);
		color: var(--frost-100);
		font-size: 0.82rem;
	}
	.search-row input:focus {
		border-color: var(--rune-300);
		outline: 2px solid rgba(168, 59, 67, 0.3);
	}
	.search-row button,
	.suggestions button {
		border: 1px solid var(--rune-400);
		background: rgba(104, 31, 41, 0.7);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.62rem;
		text-transform: uppercase;
		cursor: pointer;
	}
	.search-row button {
		padding-inline: 1.2rem;
	}
	.search-row button:hover,
	.search-row button:focus-visible,
	.suggestions button:hover,
	.suggestions button:focus-visible {
		background: var(--rune-400);
	}
	.search-row button:disabled {
		cursor: wait;
		opacity: 0.65;
	}
	.suggestions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.65rem;
		color: var(--text-muted);
		font-size: 0.65rem;
	}
	.suggestions button {
		padding: 0.3rem 0.5rem;
		border-color: rgba(197, 174, 112, 0.42);
		background: transparent;
		color: var(--brass-400);
		font-family: var(--body);
		font-size: 0.62rem;
		text-transform: none;
	}
	.search-message {
		margin: 1.5rem 0 0;
		color: var(--text-muted);
		font-size: 0.76rem;
	}
	.search-message.error {
		color: var(--danger-400);
	}
	.results {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	.result-card {
		display: grid;
		grid-template-columns: 6rem minmax(0, 1fr);
		min-width: 0;
		border: 1px solid rgba(137, 115, 69, 0.35);
		background: rgba(0, 3, 4, 0.52);
	}

	.result-card.selected {
		border-color: var(--rune-300);
		box-shadow: 0 0 18px rgba(197, 27, 39, 0.2);
	}
	.result-card > img {
		width: 6rem;
		height: 100%;
		min-height: 8rem;
		object-fit: cover;
		background: var(--ink-900);
	}
	.result-copy {
		min-width: 0;
		padding: 0.85rem;
	}
	.result-type {
		margin: 0 0 0.25rem;
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 0.52rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.result-copy h3 {
		margin: 0;
		color: var(--frost-100);
		font-size: 0.95rem;
		text-transform: uppercase;
	}
	.result-copy > p:not(.result-type) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
		margin: 0.55rem 0 0.8rem;
		color: var(--text-muted);
		font-size: 0.68rem;
		line-height: 1.6;
	}
	.result-copy a {
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.58rem;
		text-decoration: none;
		text-transform: uppercase;
	}
	.result-copy a:hover,
	.result-copy a:focus-visible {
		color: var(--frost-100);
	}

	.read-result {
		margin: 0 0.65rem 0.6rem 0;
		padding: 0.35rem 0.5rem;
		border: 1px solid rgba(197, 174, 112, 0.42);
		background: transparent;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.58rem;
		text-transform: uppercase;
		cursor: pointer;
	}

	.read-result:hover,
	.read-result:focus-visible {
		border-color: var(--rune-300);
		background: rgba(143, 17, 25, 0.45);
		color: var(--frost-100);
	}

	.selected-result {
		margin-top: 1.5rem;
		padding: clamp(1rem, 3vw, 1.75rem);
		border: 1px solid var(--rune-400);
		background: rgba(8, 11, 10, 0.88);
		box-shadow: inset 0 0 28px rgba(197, 27, 39, 0.08);
	}

	.selected-result-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid rgba(197, 174, 112, 0.24);
		padding-bottom: 1rem;
	}

	.selected-result-heading h2 {
		margin: 0.25rem 0 0;
		color: var(--frost-100);
		font-size: clamp(1.3rem, 3vw, 2.2rem);
		text-transform: uppercase;
	}

	.selected-result-heading img {
		width: 5rem;
		height: 5rem;
		border: 1px solid rgba(197, 174, 112, 0.35);
		object-fit: cover;
	}

	.selected-content {
		margin: 1rem 0;
		color: var(--text);
		font-size: 0.78rem;
		line-height: 1.8;
		white-space: pre-line;
	}

	.selected-result > a {
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.62rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	.selected-result > a:hover,
	.selected-result > a:focus-visible {
		color: var(--frost-100);
	}

	@media (max-width: 48rem) {
		.results {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 32rem) {
		.search-row {
			grid-template-columns: 1fr;
		}
		.search-row button {
			min-height: 2.8rem;
		}
	}
</style>
