<script lang="ts">
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import ForumAuthor from '$lib/components/fantasy/ForumAuthor.svelte';
	import RichTextEditor from '$lib/components/fantasy/RichTextEditor.svelte';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	type ThreadForm = { values?: { title?: string; body?: string } };
	const threadForm = () => (form as ThreadForm | null | undefined)?.values;
</script>

<svelte:head>
	<title>The Longhouse Forum | Wolves of Ragnarok</title>
	<meta
		name="description"
		content="Discuss Valheim, gaming, builds, expeditions, and community life."
	/>
</svelte:head>

<PortalPageShell title="The Longhouse Forum" eyebrow="Speak around the fire">
	<p class="intro">A working place for questions, plans, builds, and stories from the community.</p>

	{#if data.user}
		<section class="new-thread" aria-labelledby="new-thread-heading">
			<h2 id="new-thread-heading">Open a thread</h2>
			{#if form?.forumError}<p class="error" role="alert">{form.forumError}</p>{/if}
			<form method="POST" action="?/createThread">
				<label
					>Title<input
						name="title"
						maxlength="160"
						value={threadForm()?.title ?? ''}
						required
					/></label
				>
				<label
					>First post<RichTextEditor name="body" placeholder="Write the opening post..." /></label
				>
				>
				<button type="submit">Open thread</button>
			</form>
		</section>
	{:else}
		<p class="sign-in">
			Sign in to open a thread or reply. <a href={resolve('/register')}>Create an account</a>.
		</p>
	{/if}

	<section class="thread-list" aria-labelledby="threads-heading">
		<div class="section-heading">
			<h2 id="threads-heading">Recent threads</h2>
			<span>{data.threads.length} threads</span>
		</div>
		{#if data.threads.length}
			<ul>
				{#each data.threads as thread (thread.id)}
					<li>
						<div class="thread-main">
							<a class="thread-title" href={resolve(`/community/${thread.slug}`)}>{thread.title}</a>
							<p>
								{thread.posts[0]?.createdAt
									? new Date(thread.posts[0].createdAt).toLocaleDateString()
									: 'Recently updated'} · {thread._count.posts} posts
							</p>
						</div>
						<ForumAuthor author={thread.author} />
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">No threads yet. Open the first conversation.</p>
		{/if}
	</section>
</PortalPageShell>

<style>
	.intro,
	.sign-in,
	.empty {
		color: var(--text-muted);
		font-size: 0.78rem;
	}

	.new-thread,
	.thread-list {
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

	input {
		width: 100%;
		border: 1px solid rgba(168, 59, 67, 0.42);
		border-radius: 0;
		background: rgba(0, 3, 4, 0.84);
		box-shadow: inset 0 1px 8px #000;
		color: var(--frost-100);
		font: inherit;
		font-family: var(--body);
		padding: 0.65rem;
	}

	input {
		height: 2.55rem;
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

	.sign-in a,
	.thread-title {
		color: var(--brass-400);
	}

	.section-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-heading span {
		color: var(--text-muted);
		font-size: 0.65rem;
	}

	ul {
		display: grid;
		gap: 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(9rem, 13rem);
		align-items: center;
		gap: 1rem;
		padding: 0.8rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
		background: rgba(255, 255, 255, 0.015);
	}

	.thread-title {
		font-family: var(--display);
		font-size: 0.78rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	.thread-title:hover,
	.thread-title:focus-visible {
		color: var(--frost-100);
	}

	.thread-main p {
		margin: 0.35rem 0 0;
		color: var(--text-muted);
		font-size: 0.62rem;
	}

	@media (max-width: 38rem) {
		li {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
