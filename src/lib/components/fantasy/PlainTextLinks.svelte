<script lang="ts">
	import { splitPlainTextLinks } from '$lib/plain-text';

	let { text }: { text: string } = $props();
</script>

{#each splitPlainTextLinks(text) as part, index (index)}
	{#if part.kind === 'link'}
		<a href={part.href} target="_blank" rel="noopener noreferrer">{part.label}</a>
	{:else}
		{part.value}
	{/if}
{/each}
