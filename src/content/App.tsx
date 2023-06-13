import { useState } from "react";
import "./App.css";

import bro from "webextension-polyfill/dist/browser-polyfill";

function App() {
  // Copyright 2021 Google LLC
  //
  // Use of this source code is governed by a BSD-style
  // license that can be found in the LICENSE file or at
  // https://developers.google.com/open-source/licenses/bsd

  const [alarmName, setAlarmName] = useState<string>();
  const [timeValue, setTimeValue] = useState<number>();
  const [timeFormat, setTimeFormat] = useState<string>();
  const [timePeriod, setTimePeriod] = useState<number>();

  const display = document.querySelector(".alarm-display");
  const log = document.querySelector(".alarm-log");
  const form = document.querySelector<HTMLFormElement>(".create-alarm");
  const clearButton = document.getElementById("clear-display");
  const refreshButton = document.getElementById("refresh-display");
  const pad = (val: number, len = 2) => val.toString().padStart(len, "0");

  if (display && log) {
    const manager = new AlarmManager(display, log);
    manager.refreshDisplay();
    clearButton?.addEventListener("click", () => manager.cancelAllAlarms());
    refreshButton?.addEventListener("click", () => manager.refreshDisplay());

    // New alarm form

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries<string>(formData as Iterable<readonly [PropertyKey, string]>);

      // Extract form values
      const name = data["alarm-name"];
      const delay = Number.parseFloat(data["time-value"]);
      const delayFormat = data["time-format"];
      const period = Number.parseFloat(data["period"]);

      // Prepare alarm info for creation call
      const alarmInfo: Partial<{ when: number; delayInMinutes: number; periodInMinutes: number }> = {};

      if (delayFormat === "ms") {
        // Specified in milliseconds, use `when` property
        alarmInfo.when = Date.now() + delay;
      } else if (delayFormat === "min") {
        // specified in minutes, use `delayInMinutes` property
        alarmInfo.delayInMinutes = delay;
      }

      if (period) {
        alarmInfo.periodInMinutes = period;
      }

      // Create the alarm – this uses the same signature as bro.alarms.create
      manager.createAlarm(name, alarmInfo);
    });
  }
  // DOM event bindings

  // Alarm display buttons

  return (
    <>
      <section>
        <h2>Create Alarm</h2>
        <form className="create-alarm">
          <div className="create-alarm__label">Name</div>
          <div className="create-alarm__value">
            <input
              type="text"
              name="alarm-name"
              value={alarmName}
              onChange={(e) => {
                setAlarmName(e.currentTarget.value);
              }}
            />
          </div>

          <div className="create-alarm__label">Initial delay *</div>
          <div className="create-alarm__value">
            <input
              type="number"
              step="0.1"
              name="time-value"
              min="0"
              value={timeValue}
              onChange={(e) => {
                setTimeValue(Number(e.currentTarget.value));
              }}
            />

            <select
              name="time-format"
              defaultValue={"min"}
              value={timeFormat}
              onChange={(e) => {
                setTimeFormat(e.currentTarget.value);
              }}
            >
              <option id="format-minutes" value="min">
                minutes
              </option>
              <option id="format-ms" value="ms">
                milliseconds
              </option>
            </select>
          </div>

          <div className="create-alarm__label">Repetition period *</div>
          <div className="create-alarm__value">
            <input
              type="number"
              step="0.1"
              min="0"
              name="period"
              value={timePeriod}
              onChange={(e) => {
                setTimePeriod(Number(e.currentTarget.value));
              }}
            />
            minutes <br />
            <i>Non-zero values create a repeating alarm that repeats every period.</i>
          </div>

          <div className="create-alarm__label">*</div>
          <div className="create-alarm__value">
            <i>Can be set to &lt; 1 min in an unpacked extension, but not in a distributed CRX file.</i>
          </div>

          <button type="submit" className="create-alarm__submit">
            Submit
          </button>
        </form>
      </section>

      <section className="col-2">
        <section className="">
          <h2>
            Current Alarms
            <div className="display-buttons">
              <button id="clear-display">Cancel all alarms</button>
              <button id="refresh-display" title="Clear display and re-recreate alarm UI">
                Refresh
              </button>
            </div>
          </h2>

          <pre className="alarm-display"></pre>
        </section>

        <section>
          <h2>Alarm log</h2>
          <pre className="alarm-log"></pre>
        </section>
      </section>
    </>
  );
}

export default App;

class AlarmManager {
  displayElement: Element;
  logElement: Element;
  constructor(display: Element, log: Element) {
    this.displayElement = display;
    this.logElement = log;

    this.logMessage("Manager: initializing demo");

    this.displayElement.addEventListener("click", this.handleCancelAlarm);
    bro.alarms.onAlarm.addListener(this.handleAlarm);
  }

  logMessage(message: string) {
    const date = new Date();
    const pad = (val: number, len = 2) => val.toString().padStart(len, "0");
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    const ms = pad(date.getMilliseconds(), 3);
    const time = `${h}:${m}:${s}.${ms}`;

    const logLine = document.createElement("div");
    logLine.textContent = `[${time}] ${message}`;

    // Log events in reverse chronological order
    this.logElement.insertBefore(logLine, this.logElement.firstChild);
  }

  handleAlarm = async (alarm: { name: string }) => {
    const json = JSON.stringify(alarm);
    this.logMessage(`Alarm "${alarm.name}" fired\n${json}}`);
    await this.refreshDisplay();
  };

  handleCancelAlarm = async (event: Event) => {
    const target = event.target as HTMLElement;
    if (target) {
      if (!target.classList.contains("alarm-row__cancel-button")) {
        return;
      }

      const name = target.parentElement?.dataset.name;
      await this.cancelAlarm(name);
      await this.refreshDisplay();
    }
  };

  async cancelAlarm(name?: string) {
    // TODO: Remove custom promise wrapper once the Alarms API supports promises
    return bro.alarms.clear(name).then((wasCleared) => {
      if (wasCleared) {
        this.logMessage(`Manager: canceled alarm "${name}"`);
      } else {
        this.logMessage(`Manager: could not canceled alarm "${name}"`);
      }
    });
  }

  // Thin wrapper around alarms.create to log creation event
  createAlarm(name: string, alarmInfo: browser.alarms._CreateAlarmInfo) {
    bro.alarms.create(name, alarmInfo);
    const json = JSON.stringify(alarmInfo, null, 2).replace(/\s+/g, " ");
    this.logMessage(`Created "${name}"\n${json}`);
    this.refreshDisplay();
  }

  renderAlarm(alarm: browser.alarms.Alarm, isLast: boolean) {
    const alarmEl = document.createElement("div");
    alarmEl.classList.add("alarm-row");
    alarmEl.dataset.name = alarm.name;
    alarmEl.textContent = JSON.stringify(alarm) + (isLast ? "" : ",");

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("alarm-row__cancel-button");
    cancelButton.textContent = "cancel";
    alarmEl.appendChild(cancelButton);

    this.displayElement.appendChild(alarmEl);
  }

  async cancelAllAlarms() {
    // TODO: Remove custom promise wrapper once the Alarms API supports promises
    return bro.alarms.clearAll().then((wasCleared) => {
      if (wasCleared) {
        this.logMessage(`Manager: canceled all alarms"`);
      } else {
        this.logMessage(`Manager: could not canceled all alarms`);
      }
    });
  }

  async populateDisplay() {
    // TODO: Remove custom promise wrapper once the Alarms API supports promises
    return bro.alarms.getAll().then((alarms) => {
      for (const [index, alarm] of alarms.entries()) {
        const isLast = index === alarms.length - 1;
        this.renderAlarm(alarm, isLast);
      }
    });
  }

  // Simple locking mechanism to prevent multiple concurrent refreshes from rendering duplicate
  // entries in the alarms list
  #refreshing = false;

  async refreshDisplay() {
    if (this.#refreshing) {
      return;
    } // refresh in progress, bail

    this.#refreshing = true; // acquire lock
    try {
      await Promise.all([this.clearDisplay(), this.populateDisplay()]);
    } finally {
      this.#refreshing = false; // release lock
    }
  }

  async clearDisplay() {
    this.displayElement.textContent = "";
  }
}
