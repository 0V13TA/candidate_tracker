<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(false);
	let showDrawer = $state(false);
	let selectedId = $state<string | null>(null);
	let selectedCandidate = $derived(data.candidates.find((c) => c.id === selectedId));
	let draggingId = $state<string | null>(null);
	let dragOverStage = $state<string | null>(null);

	// 1. Add these filtering variables
	let searchTerm = $state('');
	let selectedRole = $state('ALL');
	let minRating = $state(0);

	// 2. Add the derived filtered array
	let filteredCandidates = $derived(
		data.candidates.filter((c) => {
			const q = searchTerm.toLowerCase();
			if (
				q &&
				!c.name.toLowerCase().includes(q) &&
				!c.role.toLowerCase().includes(q) &&
				!c.email.toLowerCase().includes(q)
			)
				return false;
			if (selectedRole !== 'ALL' && c.role !== selectedRole) return false;
			if (minRating > 0 && c.rating < minRating) return false;
			return true;
		})
	);

	const STAGES = [
		{ id: 'applied', label: 'Applied', color: 'var(--secondary)' },
		{ id: 'interview', label: 'Interview', color: 'var(--primary)' },
		{ id: 'test', label: 'Assessment', color: '#10b981' },
		{ id: 'offer', label: 'Offer Sent', color: '#f59e0b' },
		{ id: 'accepted', label: 'Accepted', color: '#3b82f6' },
		{ id: 'rejected', label: 'Archived', color: 'var(--error)' }
	];

	function openDrawer(id: string) {
		selectedId = id;
		showDrawer = true;
	}

	function handleDragStart(e: DragEvent, id: string) {
		e.dataTransfer?.setData('text/plain', id);
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
		// Delaying the opacity change ensures the browser captures a solid drag "ghost" image
		setTimeout(() => {
			draggingId = id;
		}, 0);
	}

	function handleDragEnd() {
		draggingId = null;
		dragOverStage = null;
	}

	function handleDragOver(e: DragEvent, stageId: string) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		dragOverStage = stageId;
	}

	function handleDragLeave() {
		dragOverStage = null;
	}

	async function handleDrop(e: DragEvent, newStage: string) {
		e.preventDefault();
		draggingId = null;
		dragOverStage = null;

		const id = e.dataTransfer?.getData('text/plain');
		if (!id) return;

		const cand = data.candidates.find((c) => c.id === id);
		if (cand) cand.stage = newStage;

		const formData = new FormData();
		formData.append('id', id);
		formData.append('stage', newStage);
		await fetch('?/updateStage', { method: 'POST', body: formData });
		invalidateAll();
	}
</script>

<div class="layout">
	<header class="navbar">
		<div class="brand">
			<span class="material-symbols-outlined">work</span>
			TalentFlow ATS
		</div>
		<div class="actions">
			<ThemeToggle />
			<div class="user-info">{data.user.name}</div>
		</div>
	</header>

	<main class="main-content">
		<div class="kpi-panel">
			<div>
				<div class="subtitle">Pipeline Overview</div>
				<h1>Candidate Hiring Board</h1>
			</div>
			<div style="display: flex; gap: 1rem;">
				<form method="POST" action="?/seedDemo" use:enhance>
					<button
						type="submit"
						class="btn-primary"
						style="background: var(--surface-container-high); color: var(--on-surface);"
						>Load Demo Data</button
					>
				</form>
				<button class="btn-primary" onclick={() => (showModal = true)}>+ Add Candidate</button>
			</div>
		</div>

		<div class="filters-bar">
			<div class="search-box">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search by name, role, or email..."
				/>
			</div>
			<div class="filter-group">
				<select bind:value={selectedRole}>
					<option value="ALL">All Roles</option>
					<option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
					<option value="Staff Backend Architect">Staff Backend Architect</option>
					<option value="Product Designer">Product Designer</option>
				</select>
				<select bind:value={minRating}>
					<option value={0}>All Ratings</option>
					<option value={4}>★ 4.0+ Stars</option>
					<option value={3}>★ 3.0+ Stars</option>
					<option value={2}>★ 2.0+ Stars</option>
				</select>
			</div>
		</div>

		<div class="board-scroll">
			<div class="board">
				{#each STAGES as stage}
					<div
						role="list"
						class="column {dragOverStage === stage.id ? 'drag-active' : ''}"
						ondragover={(e) => e.preventDefault()}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, stage.id)}
					>
						<div class="column-header">
							<div class="col-title">
								<span class="dot" style="background: {stage.color}"></span>
								{stage.label}
							</div>
							<span class="badge"
								>{filteredCandidates.filter((c) => c.stage === stage.id).length}</span
							>
						</div>

						<!-- Find this block inside the Kanban rendering loop -->
						<div class="card-list">
							<!-- Change `data.candidates.filter` to `filteredCandidates.filter` -->
							{#each filteredCandidates.filter((c) => c.stage === stage.id) as cand (cand.id)}
								<div
									class="card {draggingId === cand.id ? 'dragging' : ''}"
									role="button"
									tabindex="0"
									draggable="true"
                  ondragend={handleDragEnd}
									ondragstart={(e) => handleDragStart(e, cand.id)}
									onclick={() => openDrawer(cand.id)}
									onkeydown={(e) => e.key === 'Enter' && openDrawer(cand.id)}
								>
									<div class="card-header">
										<h4>{cand.name}</h4>
										<span class="rating">★ {cand.rating}</span>
									</div>
									<p class="role">{cand.role}</p>
									<div class="skills">
										{#each cand.skills.slice(0, 3) as skill}
											<span class="skill-tag">{skill}</span>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>

<!-- Drawer -->
{#if showDrawer && selectedCandidate}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onclick={() => (showDrawer = false)}
		onkeydown={(e) => e.key === 'Escape' && (showDrawer = false)}
	>
		<div
			class="drawer"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<!-- Enhanced Header with Role & Skills -->
			<div class="drawer-header">
				<div class="drawer-title-group">
					<h2>{selectedCandidate.name}</h2>
					<p class="drawer-role">{selectedCandidate.role}</p>
					<div class="skills" style="margin-top: 0.25rem;">
						{#each selectedCandidate.skills as skill}
							<span class="skill-tag">{skill}</span>
						{/each}
					</div>
				</div>
				<button
					type="button"
					class="btn-close"
					aria-label="Close drawer"
					onclick={() => (showDrawer = false)}>✕</button
				>
			</div>

			<div class="eval-row">
				<div class="form-group flex-1">
					<label for="stage-select">Current Stage</label>
					<form method="POST" action="?/updateStage" use:enhance>
						<input type="hidden" name="id" value={selectedCandidate.id} />
						<select
							id="stage-select"
							name="stage"
							value={selectedCandidate.stage}
							onchange={(e) => e.currentTarget.form?.submit()}
						>
							{#each STAGES as stage}
								<option value={stage.id}>{stage.label}</option>
							{/each}
						</select>
					</form>
				</div>

				<!-- Enhanced Interactive Star Rating -->
				<div class="form-group flex-1">
					<div
						style="display: block; font-size: 0.85rem; color: var(--secondary); margin-bottom: 0.25rem; font-weight: 500;"
					>
						Candidate Rating
					</div>
					<form method="POST" action="?/updateRating" use:enhance>
						<input type="hidden" name="id" value={selectedCandidate.id} />
						<div class="stars-container">
							<!-- Render in reverse for pure CSS hover effects -->
							{#each [5, 4, 3, 2, 1] as star}
								<button
									type="submit"
									name="rating"
									value={star}
									class="star-btn"
									class:active={selectedCandidate.rating >= star}
									aria-label="Rate {star} stars">★</button
								>
							{/each}
						</div>
					</form>
				</div>
			</div>

			<div class="notes-section">
				<h3>Interview Notes</h3>
				<form method="POST" action="?/addNote" use:enhance class="note-form">
					<input type="hidden" name="candidateId" value={selectedCandidate.id} />
					<label for="note-content" class="sr-only" style="display:none;">Add Note</label>
					<textarea id="note-content" name="content" required placeholder="Add feedback..."
					></textarea>
					<button type="submit" class="btn-primary">Post Note</button>
				</form>

				<div class="notes-list">
					{#each selectedCandidate.notes as note}
						<div class="note-card">
							<span class="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
							<p>{note.content}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Add Candidate Modal -->
{#if showModal}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onclick={() => (showModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showModal = false)}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="drawer-header">
				<h2>Add Candidate</h2>
				<button
					type="button"
					class="btn-close"
					aria-label="Close modal"
					onclick={() => (showModal = false)}>✕</button
				>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showModal = false;
					};
				}}
			>
				<div class="form-group">
					<label for="cand-name">Full Name</label>
					<input id="cand-name" name="name" required />
				</div>
				<div class="form-group">
					<label for="cand-email">Email</label>
					<input id="cand-email" name="email" type="email" required />
				</div>
				<div class="form-group">
					<label for="cand-role">Role</label>
					<input id="cand-role" name="role" required />
				</div>
				<div class="form-group">
					<label for="cand-skills">Skills (comma separated)</label>
					<input id="cand-skills" name="skills" />
				</div>
				<button type="submit" class="btn-primary w-full">Save Candidate</button>
			</form>
		</div>
	</div>
{/if}

<style>
	.layout {
		padding-top: 4rem;
	}

	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-lg);
		background: var(--surface-container-lowest);
		border-bottom: 1px solid var(--outline-variant);
		z-index: 50;
	}

	.brand {
		font-weight: 700;
		font-size: 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.user-info {
		font-weight: 600;
		padding-left: 1rem;
		border-left: 1px solid var(--outline-variant);
	}

	.main-content {
		padding: var(--space-lg);
	}

	.kpi-panel {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--surface-container-lowest);
		padding: var(--space-base);
		border-radius: 0.75rem;
		margin-bottom: var(--space-lg);
		border: 1px solid var(--outline-variant);
	}

	.subtitle {
		font-size: 0.75rem;
		color: var(--secondary);
		text-transform: uppercase;
		font-weight: 700;
	}
	.kpi-panel h1 {
		margin: 0;
		font-size: 1.5rem;
		font-family: 'Plus Jakarta Sans', sans-serif;
	}

	.btn-primary {
		background: var(--primary);
		color: var(--on-primary);
		border: none;
		padding: 0.6rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 600;
		transition: opacity 0.2s;
	}
	.btn-primary:hover {
		opacity: 0.9;
	}
	.w-full {
		width: 100%;
		margin-top: 1rem;
	}

	.board-scroll {
		overflow-x: auto;
		padding-bottom: 2rem;
	}
	.board {
		display: flex;
		gap: var(--space-md);
		min-width: max-content;
	}

	.column {
		width: var(--column-width);
		background: var(--surface-container-low);
		border-radius: 0.75rem;
		padding: var(--space-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem;
	}
	.col-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-family: 'Plus Jakarta Sans', sans-serif;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}
	.badge {
		background: var(--surface-container-lowest);
		color: var(--secondary);
		padding: 0.1rem 0.5rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.card-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		min-height: 400px;
	}

	.card {
		background: var(--surface-container-lowest);
		padding: var(--space-sm);
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		cursor: grab;
		border: 1px solid var(--outline-variant);
	}
	.card:active {
		cursor: grabbing;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
	}
	.card h4 {
		margin: 0;
		font-size: 0.95rem;
	}
	.rating {
		font-size: 0.8rem;
		color: #f59e0b;
		font-weight: 600;
	}
	.role {
		margin: 0 0 0.5rem 0;
		font-size: 0.8rem;
		color: var(--secondary);
	}

	.skills {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}
	.skill-tag {
		background: var(--surface-container-low);
		color: var(--secondary);
		font-size: 0.7rem;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
	}

	/* Overlays */
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal {
		background: var(--surface-container-lowest);
		padding: 1.5rem;
		border-radius: 1rem;
		width: 100%;
		max-width: 450px;
	}
	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 400px;
		background: var(--surface-container-lowest);
		z-index: 101;
		padding: 1.5rem;
		box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
		overflow-y: auto;
	}
	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.drawer-header h2 {
		margin: 0;
	}
	.btn-close {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		color: var(--secondary);
	}

	.form-group {
		margin-bottom: 1rem;
	}
	.form-group label {
		display: block;
		font-size: 0.85rem;
		color: var(--secondary);
		margin-bottom: 0.25rem;
		font-weight: 500;
	}

	.notes-section {
		margin-top: 2rem;
		border-top: 1px solid var(--outline-variant);
		padding-top: 1rem;
	}
	.note-form {
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.notes-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.note-card {
		background: var(--surface-container-low);
		padding: 1rem;
		border-radius: 0.5rem;
	}
	.note-card p {
		margin: 0.5rem 0 0 0;
		font-size: 0.9rem;
	}
	.note-date {
		font-size: 0.75rem;
		color: var(--secondary);
	}

	/* Append these new styles to the bottom of your <style> block */
	.eval-row {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.flex-1 {
		flex: 1;
	}

	.star-btn {
		background: none;
		border: none;
		font-size: 1.75rem;
		cursor: pointer;
		color: var(--outline-variant);
		transition: transform 0.1s;
		padding: 0;
		line-height: 1;
	}

	.star-btn:hover {
		transform: scale(1.15);
	}

	.star-btn.active {
		color: #f59e0b;
	}

	/* Drawer Header Enhancements */
	.drawer-header {
		align-items: flex-start; /* Aligns the X button to the top */
	}
	.drawer-title-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.drawer-role {
		color: var(--secondary);
		font-size: 0.95rem;
		margin: 0;
		font-weight: 500;
	}

	/* Pure CSS Interactive Star Rating */
	.stars-container {
		display: flex;
		flex-direction: row-reverse; /* Reverses DOM order for CSS sibling selector */
		justify-content: flex-end;
		gap: 0.1rem;
		margin-top: 0.25rem;
	}
	.star-btn {
		background: none;
		border: none;
		padding: 0;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: var(--outline-variant);
		transition:
			transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
			color 0.2s;
	}

	/* Reset active state when hovering container */
	.stars-container:hover .star-btn {
		color: var(--outline-variant);
	}

	/* Highlight hovered star and all visually preceding stars */
	.star-btn:hover,
	.star-btn:hover ~ .star-btn {
		color: #f59e0b;
		transform: scale(1.15);
	}

	/* Default active state */
	.star-btn.active {
		color: #f59e0b;
	}

	.filter-group {
		gap: 10px;
		padding: 10px 0;
		display: flex;
		flex-direction: column;
	}

  .column.drag-active {
    background: var(--surface-container);
    outline: 2px dashed var(--primary);
    outline-offset: -4px;
  }
  
  .card.dragging {
    opacity: 0.3;
    transform: scale(0.98);
    box-shadow: none;
  }

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		/* Navbar */
		.navbar {
			padding: 0 var(--space-base);
		}
		.user-info {
			display: none; /* Hide name to preserve space for branding and theme toggle */
		}

		/* Layout & KPI Panel */
		.main-content {
			padding: var(--space-base);
		}
		.kpi-panel {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-base);
		}
		.kpi-panel .btn-primary {
			width: 100%;
		}

		/* Stacked Kanban Board for Mobile */
		.board-scroll {
			overflow-x: hidden;
			padding-bottom: 1rem;
		}
		.board {
			flex-direction: column;
			min-width: 100%;
			padding-right: 0;
		}
		.column {
			width: 100%;
			max-width: 100%;
		}

		/* Overlays */
		.drawer {
			width: 100%;
			padding: var(--space-base);
		}
		.eval-row {
			flex-direction: column;
			gap: var(--space-md);
		}
		.modal {
			max-width: calc(100% - 2rem);
			padding: var(--space-lg);
			margin: 1rem;
		}
	}
</style>
