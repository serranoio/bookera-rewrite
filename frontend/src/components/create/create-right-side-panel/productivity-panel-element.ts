import { LitElement, html, css, TemplateResult, render } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js'
import install from '@twind/with-web-components'
import config from "../../../twind.config"
import { ContextConsumer } from '@lit/context';
import { getWordCount, studioPageContext } from '../../../lib/model/context';
import Chart from 'chart.js/auto';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/alert/alert.js';
import { notify } from '../../../lib/model/lit';

export enum PomodoroMode {
	Words = "Words",
	Timer = "Timer"
}

export enum Period {
	Focus = "Focus",
	Break = "Break"
}

export const TIMER_LS = "timer"

export interface PomodooPeriod {
	startTime: number;
	endTime: number;
	beginningWordCount: number;
	endingWordCount: number;
}

export interface Statistics {
	totalWordCount: number;
	pomodoroPeriods: PomodooPeriod[];
}

export const defaultStatistics: Statistics = {
	totalWordCount: 0,
	pomodoroPeriods: [],
}

const POMODORO_CHART_ID = "pomodoro-chart"


export const MILLISECONDS = 1000
export const SECONDS = MILLISECONDS  * 60 
export const MINUTES = SECONDS * 60

@customElement('productivity-panel-element')
@install(config)
export class ProductivityPanelElement extends LitElement {
	static styles = [
		css`
		* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
		}

			:host {
				padding: 0 var(--spacingXSmall);
				display: block;

			}

			.title {
				text-align: center;
				font-size: var(--text-xs);
			}

			.timer-box {
				border: 1px solid slate;
				border-radius: var(--spacingXSmall);
			}
		`
	];

	@property()
	selectedPomodoroMode: PomodoroMode = PomodoroMode.Timer

	activatePanel(pomodoroMode: PomodoroMode) {
		this.selectedPomodoroMode = pomodoroMode
	}

	@property()
	selectedPeriod: Period = Period.Focus;

	@property()
	isSettingsPanelOpened: boolean = false;

	@property()
	focusPeriodInMinutes: number = .1;

	@property()
	breakPeriodInMinutes: number = .1;

	@property()
	statistics: Statistics = defaultStatistics

	@state()
	timerTemplateResult = html`${this.formatPeriodInTime(this.getBeginningTimePeriod(), true)}`

	@property()
	hasTimerStarted: boolean = false;

	@property()
	timerInterval: any;

	@property()
	displayStatsPanel: boolean = false;

	@property()
	initializeGraph: boolean = false;

	@property()
	timeRemaining: number = 0;

	@property()
	hasSessionStarted: boolean = false;

	@property()
	currentPomodoroPeriod: PomodooPeriod | null = null

	@property()
	resetTimerDurationOverride: boolean = false;

	@property()
	chartReference: any;

	@property()
	zeroTime: boolean = false;


	setBeginningTimePeriod(): void {
		this.timerTemplateResult = html`${this.formatPeriodInTime(this.getBeginningTimePeriod(), true)}`
	}

	changePeriod(newSelectedPeriod: Period, startTimer = false) {
		if (this.hasSessionStarted) {
			if(this.hasTimerStarted) {
				this.resetTimerDurationOverride = true
			}
				
			this.countPomodoroPeriod();
		}
 
		this.selectedPeriod = newSelectedPeriod
		this.timerTemplateResult = this.formatPeriodInTime(this.getBeginningTimePeriod(), true)

		if (startTimer) {
			this.startTimer()
		}
	}


	getBeginningTimePeriod() {
		return (this.calcPeriod() * 1000 + Date.now()) -  Date.now()
	}

	getFocusPeriod() {
		return this.focusPeriodInMinutes * 60
	}
	
	getBreakPeriod() {
		return this.breakPeriodInMinutes * 60 
	}

	getMinutes(time: number) {
		return Math.floor((time % (MINUTES)) / (SECONDS))
	}

	getSeconds(time: number) {
		return Math.round((time % (SECONDS)) / (MILLISECONDS))
	}

	formatPeriodInTime(time: number, format: boolean) {
		let minutes: any = this.getMinutes(time)
		let seconds: any = this.getSeconds(time)

		let minutesHTML = html``;
		let secondsHTML = html``;

		if (minutes > 0) {
			minutesHTML = html`<span>${minutes} minutes</span>`
		}
		if (seconds > 0) {
			secondsHTML = html`${minutes > 0 ? "&" : ""} <span>${seconds} second</span>`
		}

		if (seconds === 0) {
			seconds = seconds + "0"
		}

		if (seconds as number % 10 !== 0 && seconds < 10) {
			seconds = "0" + seconds
		}

		if (minutes === 0) {
			minutes += "0"
		}
		
		if (minutes === "00" && seconds === "00") {
			console.log(this.zeroTime)
			this.zeroTime = true
		} else {
			this.zeroTime = false
		}

		if (format) {
			return html`<div data-test="time" class="p-4 text-4xl text-center mb-2"><p>${minutes}:${seconds}</p></div>` 
		}



		

		return html`${minutesHTML} ${secondsHTML} `
	}

	calcPeriod() {
		// when paused, and we switch from Focus to Break we get new period
		if (!this.resetTimerDurationOverride) {
			return this.selectedPeriod === Period.Focus ? this.getFocusPeriod() : this.getBreakPeriod()
		}

		// when paused, we will take the remaining time for the next period
		if (this.hasSessionStarted && !this.hasTimerStarted) {
			return this.timeRemaining / 1000
		}
		
		// everything else
		return this.selectedPeriod === Period.Focus ? this.getFocusPeriod() : this.getBreakPeriod()
	}

	_studioPageData = new ContextConsumer(this, {
		context: studioPageContext,
		subscribe: true,
		callback(ctx) {
			// @ts-ignore
			this._studioPageData = ctx
		}})


		displayIntervalFinishToast(toastMessage?: string) {
			if (toastMessage) {
				notify(`${toastMessage}`, 'neutral', 'check2-all')
				return
			}

			if (this.selectedPeriod === Period.Focus) {
				notify("🎉🎉🎉 Nice work, you deserve a break!", 'neutral', 'check2-all')
			} else {
				notify("It's time to get heads down again!!!", 'neutral', 'chevron-double-down')
			}
		}

		countPomodoroPeriod(toastMessage?: string) {
			this.currentPomodoroPeriod!.endingWordCount = getWordCount(this._studioPageData.value!)
			this.statistics.pomodoroPeriods.push(this.currentPomodoroPeriod!)
			this.displayIntervalFinishToast(toastMessage)
			clearInterval(this.timerInterval)
		}

	startTimer() {
		const duration  = this.calcPeriod()
		// this is reset every time to be true, but that does not change anything
		this.hasSessionStarted = true
		this.hasTimerStarted = true
		this.displayStatsPanel = false
		this.resetTimerDurationOverride = false

		const startTime = Date.now()
		const endTime = startTime + duration * 1000
		this.currentPomodoroPeriod = {
			startTime: startTime,
			endTime: endTime,
			beginningWordCount: getWordCount(this._studioPageData.value!),
			endingWordCount: 0,
		}
		
		this.timerInterval = setInterval(() => {
			const now = Date.now();
			this.timeRemaining = endTime - now;

			
			if (this.timeRemaining <= 0) {
				this.timerTemplateResult = html`<div data-test="time" class="p-4 text-4xl text-center mb-2">00:00</div>`
				// start new period
				// get ending word count
				
				setTimeout(() => {
					this.changePeriod(this.selectedPeriod === Period.Focus ? Period.Break : Period.Focus)
					this.startTimer()
					}, 0)

				return;
			}

			this.timerTemplateResult = this.formatPeriodInTime(this.timeRemaining, true)
		}, 1000);
	}

	pauseTimer() {
		// remaining becomes the time that you start at. It's no longer duration
		clearInterval(this.timerInterval)
		this.hasTimerStarted = false;
		// this.startTimer()
	}

	renderSettingsButton() {
		return html`
		<sl-tooltip content="Settings">
			<sl-icon-button data-test="settings-button" @click=${() => {
				this.isSettingsPanelOpened = !this.isSettingsPanelOpened
			}} name="gear" class="absolute right-0 translate-x-[-50%] translate-y-[-50%]"></sl-icon-button>
		</sl-tooltip>
		`
	}

	renderEndSessionButton() {
		return html`${this.hasSessionStarted ? html`<sl-button class="w-full" variant="danger" outline @click=${() => {
			this.countPomodoroPeriod("🎉🎉🎉  Great study session!!");
			this.setBeginningTimePeriod()
			this.hasTimerStarted = false
			this.hasSessionStarted = false
			this.displayStatsPanel = true

		}}>End Session</sl-button>` : ""}`
	}
	renderStatsPanel() {
		if (!this.displayStatsPanel) return 

		setTimeout(() => {
			this.initializeGraph = true
		},
		200)

		return html`<div class="border border-slate-300 rounded p-2">
			<p class="text-start text-slate-500 mb-2 text-xs">Statistics</p>
			<h3 class="text-center text-xs mb-4">Congrats on your study session!</h3>
			<canvas class="w-full" id=${POMODORO_CHART_ID} width="100%" height="80rem"></canvas>
		</div>`
	}

	renderTimerPanel() {
		const settings = html`
<div class="border border-slate-300 rounded p-2 mb-2">
	<h4 class="text-center mb-2">
		Settings
	</h4>
	<p class="text-xs text-slate-500 mb-4">Change the amount of time</p>
	<sl-input 
	data-test="focus-input"
	step=".1"
	label="Focus (in minutes)"
	size="small"
	type="number"
	?disabled=${this.hasTimerStarted ? true : false}
	value=${this.focusPeriodInMinutes}
	@sl-change=${(e: any) => { this.focusPeriodInMinutes = e.target.value; this.setBeginningTimePeriod() }}></sl-input>
	<sl-input 
	data-test="break-input"
	?disabled=${this.hasTimerStarted ? true : false}
	step="1" label="Break (in minutes)" size="small" type="number" value=${this.breakPeriodInMinutes} @sl-change=${(e: any) => { this.breakPeriodInMinutes = e.target.value; this.setBeginningTimePeriod()}}></sl-input>
</div>
`

return html`
<div class="${this.selectedPomodoroMode === PomodoroMode.Timer ? "block" : "hidden"}">
	<p class="text-slate-500 text-xs">Classic pomodoro technique. Focus for ${this.formatPeriodInTime((this.getFocusPeriod() * 1000 + Date.now()) - Date.now(), false)} and break for ${this.formatPeriodInTime((this.getBreakPeriod() * 1000 + Date.now()) - Date.now(), false)}</p>
	<div class="border border-slate-300 rounded p-4 mb-2">
		${this.renderSettingsButton()}
		<div class="mb-4">
			${this.timerTemplateResult}
			<div class="w-full flex justify-center align-center">
				<sl-tooltip content=${this.hasTimerStarted ? "pause" : "play"}>
					<sl-icon-button
					data-test="time-action"
					style="font-size: 2rem;"
					@click=${() => {
						if (this.chartReference) {
							this.chartReference.destroy()
							this.chartReference = null
						}
						this.initializeGraph = false
						this.statistics = structuredClone(defaultStatistics)
						
						this.hasTimerStarted ? this.pauseTimer() : this.startTimer()
						
					}}
					name=${this.hasTimerStarted ? "pause" : "play"}
					></sl-icon-button>
				</sl-tooltip>
			</div>
		</div>
		<div class="flex gap-2">
			<sl-button @click=${() => {
				if (this.selectedPeriod === Period.Break && this.hasTimerStarted) {
					this.changePeriod(Period.Focus, true)
				}
				if (!this.hasTimerStarted) {
					this.changePeriod(Period.Focus)
				}
				
			}} 
				class=${"w-full"}
				outline 
				variant=${this.selectedPeriod === Period.Focus ? "primary" : ""}
				?disabled=${this.zeroTime ? true : false}
				>${Period.Focus}</sl-button>
				<sl-button 
				?disabled=${this.zeroTime ? true : false}
				@click=${() => {
					if (this.selectedPeriod === Period.Focus && this.hasTimerStarted) {
						this.changePeriod(Period.Break, true)
					}
					if (!this.hasTimerStarted) {
						this.changePeriod(Period.Break)
					}
					
				}} class=${"w-full"} outline variant=${this.selectedPeriod === Period.Break ? "primary" : ""}>${Period.Break}</sl-button>
	</div>
	
</div>
${this.isSettingsPanelOpened ? settings : ""}
${this.renderEndSessionButton()}
${this.renderStatsPanel()}
	</div>
		`;
	}
	
	renderWordsPanel() {
		return html``
	}
	
	initializeChart() {
		const chart = (this.shadowRoot?.querySelector(`#${POMODORO_CHART_ID}`))
		if (!chart) return

		const wordCounts = this.statistics.pomodoroPeriods.map((period: PomodooPeriod) => period.endingWordCount - period.beginningWordCount)
		chart?.setAttribute("word_counts", wordCounts.join("-"))

		if (!this.initializeGraph) return
		

		if (this.chartReference) {
			this.chartReference.destroy();
		}



		this.chartReference = new Chart(
			chart,
			{
				type: 'bar',
				data: {
					labels: wordCounts.map((_, num) => num+1),
					datasets: [
						{
							label: "Word Count",
							data: wordCounts
						}
					]
				}
			}
		);
	}

	render() {
		this.initializeChart()

		return html`
		<h3 class="title text-slate-700 mb-4">Stay productive using the Pomodoro technique!</h3>
		<div class="flex gap-2 mb-4">
			<sl-button data-test=${PomodoroMode.Words} @click=${() => {this.activatePanel(PomodoroMode.Words)}} class=${"w-full"} variant=${this.selectedPomodoroMode === PomodoroMode.Words ? "primary" : ""}>${PomodoroMode.Words}</sl-button>
			<sl-button @click=${() => {this.activatePanel(PomodoroMode.Timer)}} class=${"w-full"} variant=${this.selectedPomodoroMode === PomodoroMode.Timer ? "primary" : ""}>${PomodoroMode.Timer}</sl-button>
		</div>
		<div>
			${this.renderTimerPanel()}
			${this.renderWordsPanel()}
		</div>
		`;
	}
}
