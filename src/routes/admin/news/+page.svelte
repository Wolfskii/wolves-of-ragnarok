<script lang="ts">
	import RichTextEditor from '$lib/components/fantasy/RichTextEditor.svelte';
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Write News | Wolves of Ragnarok</title></svelte:head>

<PortalPageShell title="Write News" eyebrow="Publish from the war council">
	<p class="intro">
		Share announcements, event reports, and stories from the games you play together.
	</p>
	{#if form?.newsError}<p class="error" role="alert">{form.newsError}</p>{/if}
	<form method="POST" action="?/publish">
		<label>Headline<input name="title" maxlength="180" required /></label>
		<label>Summary<input name="excerpt" maxlength="320" required /></label>
		<label>Story<RichTextEditor name="body" placeholder="Write the full story..." /></label>
		<button type="submit">Publish news</button>
	</form>

	<section class="published" aria-labelledby="published-heading">
		<h2 id="published-heading">Recent submissions</h2>
		{#if data.posts.length}
			<ul>
				{#each data.posts as post (post.id)}
					<li>
						<strong>{post.title}</strong><span
							>{post.status} · {post.createdAt.toLocaleDateString()}</span
						>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No news has been submitted yet.</p>
		{/if}
	</section>
</PortalPageShell>

<style>
	.intro,
	.published p {
		color: var(--text-muted);
		font-size: 0.78rem;
	}

	form,
	label {
		display: grid;
		gap: 0.35rem;
	}

	form {
		gap: 0.8rem;
		margin-top: 1.5rem;
	}

	label {
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.62rem;
		text-transform: uppercase;
	}

	input {
		width: 100%;
		height: 2.7rem;
		border: 1px solid rgba(168, 59, 67, 0.42);
		border-radius: 0;
		background: rgba(0, 3, 4, 0.84);
		box-shadow: inset 0 1px 8px #000;
		color: var(--frost-100);
		padding-inline: 0.7rem;
	}

	button {
		min-height: 2.7rem;
		border: 1px solid var(--brass-600);
		border-radius: 0;
		background: var(--glass-button);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.64rem;
		text-transform: uppercase;
		cursor: pointer;
	}

	.error {
		padding: 0.65rem;
		border-left: 2px solid var(--danger-400);
		background: rgba(101, 27, 19, 0.28);
		color: #f1b1a5;
		font-size: 0.7rem;
	}

	.published {
		margin-top: 2rem;
		padding-top: 1.25rem;
		border-top: 1px solid rgba(137, 115, 69, 0.35);
	}

	h2 {
		margin: 0 0 0.8rem;
		color: var(--frost-100);
		font-size: 0.92rem;
		text-transform: uppercase;
	}

	ul {
		display: grid;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.65rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
	}
	li strong {
		color: var(--frost-100);
		font-size: 0.75rem;
	}
	li span {
		color: var(--text-muted);
		font-size: 0.62rem;
	}
</style>
