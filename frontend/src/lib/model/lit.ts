
export const escapeHtml = (html: string) => {
	const div = document.createElement('div');
	const p = document.createElement('p');
	p.textContent = html
	div.appendChild(p)
	// this is cool, this actually renders the element onto an element
	// render(this.timerTemplateResult, div)

	return div.innerHTML;
}
	// Custom function to emit toast notifications
export const	notify = (message: string, variant = 'primary', icon = 'info-circle', duration = 6000) => {
		const alert = Object.assign(document.createElement('sl-alert'), {
			variant,
			closable: true,
			duration: duration,
			innerHTML: `
				<sl-icon name="${icon}" slot="icon"></sl-icon>
				${escapeHtml(message)}
			`
		});

		document.body.append(alert);
		// @ts-ignore
		return alert.toast();
	}
