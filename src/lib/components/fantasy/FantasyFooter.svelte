<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer>
	<div class="rune-line" aria-hidden="true">
		<span>ᚱ</span><i></i><span>ᛟ</span><i></i><span>ᚲ</span>
	</div>
	<img src="/images/branding/logo-wolf-light.png" alt="" width="576" height="642" />
	<p>Wolves of Ragnarok</p>
	<small>Where Vikings Gather, Ragnarok Begins.</small>
	<nav aria-label="Footer navigation">
		<a href={resolve('/rules')}>Guild rules</a>
		<a href={resolve('/contact')}>Contact</a>
		<a href="#discord">Discord</a>
	</nav>
</footer>

<style>
	footer {
		position: relative;
		z-index: 3;
		padding: 4rem 1rem 2rem;
		background: linear-gradient(180deg, transparent, rgba(2, 5, 7, 0.94) 35%);
		text-align: center;
	}

	.rune-line {
		display: grid;
		grid-template-columns: auto minmax(2rem, 8rem) auto minmax(2rem, 8rem) auto;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: var(--brass-400);
		font-family: var(--display);
	}

	.rune-line i {
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--brass-600), transparent);
	}

	img {
		width: 3.5rem;
		height: auto;
		margin: 1.5rem auto 0;
		opacity: 0.72;
	}

	p {
		margin: 0.85rem 0 0;
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.78rem;
		text-transform: uppercase;
	}

	small {
		color: var(--text-muted);
		font-size: 0.58rem;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		margin-top: 0.75rem;
	}

	a {
		color: var(--text-muted);
		font-size: 0.6rem;
		text-transform: uppercase;
	}
</style>
