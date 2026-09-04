<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Toggle between login and register views
	let isLogin = $state(true);

	import { invalidateAll } from '$app/navigation';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();

	// UI State
	let showModal = $state(false);
	let selectedId = $state<string | null>(null);

	// Derived state for the drawer
	let selectedCandidate = $derived(data.candidates.find((c) => c.id === selectedId));

	const stages = [
		{ id: 'applied', label: 'Applied', color: 'bg-secondary' },
		{ id: 'interview', label: 'Interview', color: 'bg-primary-container' },
		{ id: 'test', label: 'Assessment', color: 'bg-surface-tint' },
		{ id: 'offer', label: 'Offer Sent', color: 'bg-tertiary-container' },
		{ id: 'accepted', label: 'Accepted', color: 'bg-tertiary' },
		{ id: 'rejected', label: 'Archived', color: 'bg-error' }
	];

	function handleDragStart(e: DragEvent, id: string) {
		e.dataTransfer?.setData('text/plain', id);
	}

	async function handleDrop(e: DragEvent, newStage: string) {
		e.preventDefault();
		const id = e.dataTransfer?.getData('text/plain');
		if (!id) return;

		// Optimistic UI update
		const cand = data.candidates.find((c) => c.id === id);
		if (cand) cand.stage = newStage;

		// Background server update
		const formData = new FormData();
		formData.append('id', id);
		formData.append('stage', newStage);
		await fetch('?/updateStage', { method: 'POST', body: formData });
		invalidateAll();
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Register'} | TalentFlow ATS</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<span class="material-symbols-outlined logo-icon">work</span>
			<h1>TalentFlow ATS</h1>
			<p class="subtitle">
				{isLogin ? 'Welcome back to your pipeline.' : 'Create your account to get started.'}
			</p>
		</div>

		{#if isLogin}
			<!-- LOGIN FORM -->
			<form method="post" action="?/login" use:enhance class="auth-form">
				{#if form?.action === 'login' && form?.message}
					<div class="error-message">
						<span class="material-symbols-outlined">error</span>
						{form.message}
					</div>
				{/if}

				<div class="input-group">
					<label for="login-email">Email Address</label>
					<div class="input-wrapper">
						<span class="material-symbols-outlined input-icon">mail</span>
						<input
							type="email"
							id="login-email"
							name="email"
							required
							placeholder="you@company.com"
						/>
					</div>
				</div>

				<div class="input-group">
					<label for="login-password">Password</label>
					<div class="input-wrapper">
						<span class="material-symbols-outlined input-icon">lock</span>
						<input
							type="password"
							id="login-password"
							name="password"
							required
							placeholder="••••••••"
						/>
					</div>
				</div>

				<button type="submit" class="btn-submit">Sign In</button>
			</form>
		{:else}
			<!-- REGISTER FORM -->
			<form method="post" action="?/register" use:enhance class="auth-form">
				{#if form?.action === 'register' && form?.message}
					<div class="error-message">
						<span class="material-symbols-outlined">error</span>
						{form.message}
					</div>
				{/if}

				<div class="input-group">
					<label for="register-name">Full Name</label>
					<div class="input-wrapper">
						<span class="material-symbols-outlined input-icon">person</span>
						<input type="text" id="register-name" name="name" required placeholder="Jane Doe" />
					</div>
				</div>

				<div class="input-group">
					<label for="register-email">Email Address</label>
					<div class="input-wrapper">
						<span class="material-symbols-outlined input-icon">mail</span>
						<input
							type="email"
							id="register-email"
							name="email"
							required
							placeholder="you@company.com"
						/>
					</div>
				</div>

				<div class="input-group">
					<label for="register-password">Password</label>
					<div class="input-wrapper">
						<span class="material-symbols-outlined input-icon">lock</span>
						<input
							type="password"
							id="register-password"
							name="password"
							required
							minlength="8"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<button type="submit" class="btn-submit">Create Account</button>
			</form>
		{/if}

		<div class="auth-footer">
			<p>
				{isLogin ? "Don't have an account?" : 'Already have an account?'}
				<button type="button" class="btn-toggle" onclick={() => (isLogin = !isLogin)}>
					{isLogin ? 'Register here' : 'Sign in here'}
				</button>
			</p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
		background-color: var(--surface);
	}

	.auth-card {
		width: 100%;
		max-width: 26rem;
		background: var(--surface-container-lowest);
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
		padding: var(--space-2xl) var(--space-xl);
		border: 1px solid var(--outline-variant);
	}

	.auth-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.logo-icon {
		font-size: 2.5rem;
		color: var(--primary);
		margin-bottom: var(--space-sm);
	}

	.auth-header h1 {
		font-family: var(--font-headline);
		font-size: 1.5rem;
		color: var(--on-surface);
		margin: 0 0 var(--space-2xs) 0;
	}

	.subtitle {
		color: var(--secondary);
		font-size: 0.875rem;
		margin: 0;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-base);
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		background: var(--error-container);
		color: var(--error);
		padding: var(--space-sm) var(--space-md);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.error-message .material-symbols-outlined {
		font-size: 1.25rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.input-group label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--on-surface-variant);
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: var(--space-md);
		color: var(--secondary);
		font-size: 1.125rem;
		pointer-events: none;
	}

	.input-wrapper input {
		width: 100%;
		height: 2.75rem;
		padding-left: 2.75rem;
		padding-right: var(--space-md);
		background: var(--surface-container-low);
		border: 1px solid var(--outline-variant);
		border-radius: 0.75rem;
		color: var(--on-surface);
		font-family: var(--font-body);
		font-size: 0.875rem;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.input-wrapper input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--primary-container);
		background: var(--surface-container-lowest);
	}

	.input-wrapper input::placeholder {
		color: var(--secondary);
		opacity: 0.7;
	}

	.btn-submit {
		width: 100%;
		height: 2.75rem;
		margin-top: var(--space-sm);
		background: var(--primary);
		color: var(--on-primary);
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.btn-submit:hover {
		background: var(--primary-container);
	}

	.btn-submit:active {
		transform: scale(0.98);
	}

	.auth-footer {
		margin-top: var(--space-xl);
		text-align: center;
		font-size: 0.875rem;
		color: var(--secondary);
	}

	.btn-toggle {
		background: none;
		border: none;
		color: var(--primary);
		font-weight: 600;
		font-family: var(--font-body);
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0;
		margin-left: var(--space-2xs);
	}

	.btn-toggle:hover {
		text-decoration: underline;
	}
</style>
