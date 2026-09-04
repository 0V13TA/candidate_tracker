<script lang="ts">
	import { onMount } from 'svelte';

	let isDark = $state(false);

	onMount(() => {
		isDark = document.documentElement.getAttribute('data-theme') === 'dark';
	});

	function toggleTheme() {
		isDark = !isDark;
		const newTheme = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	}
</script>

<button
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label="Toggle dark mode"
	title="Toggle dark mode"
>
	<span class="material-symbols-outlined">
		{isDark ? 'light_mode' : 'dark_mode'}
	</span>
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		border: none;
		background: var(--surface-container-low);
		color: var(--secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.theme-toggle:hover {
		background: var(--surface-container-high);
		color: var(--on-surface);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}
</style>
