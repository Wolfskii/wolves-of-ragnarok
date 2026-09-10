<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<a class="portal-brand" href={resolve('/')} aria-label="Wolves of Ragnarok home">
	<img src="/images/branding/logo-wolf-light.png" alt="" width="576" height="642" />
	<h1><span>WOLVES OF</span><strong>RAGNAROK</strong></h1>
</a>

<style>
	.portal-brand {
		position: relative;
		z-index: 8;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 15rem;
		margin-bottom: 0;
		padding-top: 0.5rem;
		color: var(--frost-100);
		text-decoration: none;
		text-shadow: 0 3px 15px #000;
	}

	.portal-brand img {
		width: clamp(5.5rem, 8vw, 8rem);
		aspect-ratio: 576 / 642;
		height: auto;
		object-fit: contain;
	}

	.portal-brand h1 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 4.25rem);
		line-height: 0.95;
		text-align: left;
		text-transform: uppercase;
	}

	.portal-brand h1 span,
	.portal-brand h1 strong {
		display: block;
	}

	.portal-brand h1 strong {
		color: var(--rune-300);
		font-weight: 400;
	}

	@media (max-width: 36rem) {
		.portal-brand {
			flex-direction: column;
			gap: 0.25rem;
			min-height: 10rem;
		}

		.portal-brand h1 {
			text-align: center;
		}
	}
</style>
