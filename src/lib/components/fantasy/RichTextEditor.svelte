<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags -- value is sanitized before it reaches this editor. */
	import {
		Bold,
		ImagePlus,
		Italic,
		Link,
		List,
		ListOrdered,
		Quote,
		Underline
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		name = 'body',
		value = '',
		placeholder = 'Write here...'
	}: { name?: string; value?: string; placeholder?: string } = $props();

	let editor: HTMLDivElement;
	let imageInput: HTMLInputElement;
	let content = $state('');
	let uploadError = $state('');
	let uploading = $state(false);

	onMount(sync);

	function sync() {
		content = editor?.innerHTML ?? '';
	}

	function format(command: string, commandValue?: string) {
		editor?.focus();
		document.execCommand(command, false, commandValue);
		sync();
	}

	function addLink() {
		const url = window.prompt('Link URL');
		if (url) format('createLink', url);
	}

	async function uploadImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		uploading = true;
		uploadError = '';
		try {
			const formData = new FormData();
			formData.set('file', file);
			const response = await fetch('/api/media/upload', { method: 'POST', body: formData });
			const result = (await response.json()) as { url?: string; error?: string };
			if (!response.ok || !result.url) {
				uploadError = result.error ?? 'Image upload failed.';
				return;
			}
			format('insertImage', result.url);
		} catch {
			uploadError = 'Image upload failed.';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="editor">
	<div class="toolbar" aria-label="Formatting tools">
		<button type="button" onclick={() => format('bold')} aria-label="Bold" title="Bold"
			><Bold size={15} /></button
		>
		<button type="button" onclick={() => format('italic')} aria-label="Italic" title="Italic"
			><Italic size={15} /></button
		>
		<button
			type="button"
			onclick={() => format('underline')}
			aria-label="Underline"
			title="Underline"><Underline size={15} /></button
		>
		<button
			type="button"
			onclick={() => format('formatBlock', 'blockquote')}
			aria-label="Quote"
			title="Quote"><Quote size={15} /></button
		>
		<button
			type="button"
			onclick={() => format('insertUnorderedList')}
			aria-label="Bullet list"
			title="Bullet list"><List size={15} /></button
		>
		<button
			type="button"
			onclick={() => format('insertOrderedList')}
			aria-label="Numbered list"
			title="Numbered list"><ListOrdered size={15} /></button
		>
		<button type="button" onclick={addLink} aria-label="Add link" title="Add link"
			><Link size={15} /></button
		>
		<button
			type="button"
			onclick={() => imageInput?.click()}
			disabled={uploading}
			aria-label="Insert image"
			title="Insert image"><ImagePlus size={15} /></button
		>
		<input
			bind:this={imageInput}
			class="image-input"
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif"
			onchange={uploadImage}
		/>
	</div>
	<div
		class="editor-surface"
		contenteditable="true"
		role="textbox"
		aria-multiline="true"
		aria-label={placeholder}
		data-placeholder={placeholder}
		bind:this={editor}
		oninput={sync}
		onblur={sync}
	>
		{@html value}
	</div>
	<input type="hidden" {name} value={content} />
	{#if uploadError}<p class="editor-error" role="alert">{uploadError}</p>{/if}
</div>

<style>
	.editor {
		border: 1px solid rgba(168, 59, 67, 0.42);
		background: rgba(0, 3, 4, 0.84);
		box-shadow: inset 0 1px 8px #000;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		padding: 0.35rem;
		border-bottom: 1px solid rgba(137, 115, 69, 0.35);
		background: rgba(255, 255, 255, 0.025);
	}

	.toolbar button {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		min-height: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--steel-300);
		cursor: pointer;
	}

	.toolbar button:hover,
	.toolbar button:focus-visible {
		border-color: var(--brass-600);
		color: var(--brass-400);
	}

	.toolbar button:disabled {
		cursor: wait;
		opacity: 0.5;
	}

	.image-input {
		display: none;
	}

	.editor-surface {
		min-height: 9rem;
		padding: 0.8rem;
		outline: 0;
		color: var(--frost-100);
		font-family: var(--body);
		font-size: 0.8rem;
		line-height: 1.7;
	}

	.editor-surface:empty::before {
		content: attr(data-placeholder);
		color: var(--text-muted);
		pointer-events: none;
	}

	.editor-surface :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 0.75rem 0;
	}

	.editor-surface :global(blockquote) {
		margin: 0.75rem 0;
		padding-left: 0.8rem;
		border-left: 2px solid var(--brass-600);
		color: var(--text-muted);
	}

	.editor-error {
		margin: 0;
		padding: 0.5rem 0.8rem;
		border-top: 1px solid rgba(225, 121, 101, 0.3);
		color: var(--danger-400);
		font-size: 0.65rem;
	}
</style>
