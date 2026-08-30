<script lang="ts">
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import ForumAuthor from '$lib/components/fantasy/ForumAuthor.svelte';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	type ReplyForm = { body?: string };
	const replyForm = () => (form as ReplyForm | null | undefined)?.body;
</script>

<svelte:head>
	<title>{data.thread.title} | The Longhouse Forum</title>
	<meta name="description" content={`Discussion thread: ${data.thread.title}`} />
</svelte:head>

<PortalPageShell title={data.thread.title} eyebrow="The Longhouse Forum">
	<p class="back"><a href={resolve('/community')}>Back to all threads</a></p>
	<section class="posts" aria-label="Thread posts">
		{#each data.thread.posts as post, index (post.id)}
			<article class="post">
				<header>
					<ForumAuthor author={post.author} />
					<time datetime={post.createdAt.toISOString()}
						>{new Date(post.createdAt).toLocaleString()}</time
					>
				</header>
				<div class="post-body">{post.body}</div>
				<span class="post-number">#{index + 1}</span>
			</article>
		{/each}
	</section>

	{#if data.user}
		<section class="reply" aria-labelledby="reply-heading">
			<h2 id="reply-heading">Add a reply</h2>
			{#if form?.replyError}<p class="error" role="alert">{form.replyError}</p>{/if}
			<form method="POST" action="?/reply">
				<label
					>Reply<textarea name="body" rows="5" maxlength="10000" required
						>{replyForm() ?? ''}</textarea
					></label
				>
				<button type="submit">Post reply</button>
			</form>
		</section>
	{:else}
		<p class="sign-in">Sign in to reply. <a href={resolve('/register')}>Create an account</a>.</p>
	{/if}
</PortalPageShell>

<style>
	.back,
	.sign-in {
		margin: 0 0 1.25rem;
		color: var(--text-muted);
		font-size: 0.72rem;
	}

	.back a,
	.sign-in a {
		color: var(--brass-400);
	}

	.posts {
		display: grid;
		gap: 0.8rem;
	}

	.post {
		position: relative;
		padding: 0.9rem;
		border: 1px solid rgba(137, 115, 69, 0.35);
		background: rgba(0, 3, 4, 0.42);
	}

	.post header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.65rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
	}

	time,
	.post-number {
		color: var(--text-muted);
		font-size: 0.6rem;
	}

	.post-body {
		padding: 1rem 0.25rem 0.4rem;
		color: var(--frost-100);
		font-size: 0.8rem;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.post-number {
		position: absolute;
		top: 0.9rem;
		right: 0.9rem;
	}

	.reply {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid rgba(137, 115, 69, 0.35);
	}

	h2 {
		margin: 0 0 0.8rem;
		color: var(--frost-100);
		font-size: 0.92rem;
		text-transform: uppercase;
	}

	form,
	label {
		display: grid;
		gap: 0.35rem;
	}

	form {
		gap: 0.7rem;
	}

	label {
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.62rem;
		text-transform: uppercase;
	}

	textarea {
		width: 100%;
		border: 1px solid rgba(168, 59, 67, 0.42);
		border-radius: 0;
		background: rgba(0, 3, 4, 0.84);
		box-shadow: inset 0 1px 8px #000;
		color: var(--frost-100);
		font-family: var(--body);
		padding: 0.65rem;
		resize: vertical;
	}

	button {
		min-height: 2.55rem;
		border: 1px solid var(--brass-600);
		border-radius: 0;
		background: var(--glass-button);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.62rem;
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

	@media (max-width: 38rem) {
		.post header {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
