import { appState } from '../state/appState';

export class Settings {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'settings-page p-4';
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="max-w-2xl mx-auto bg-bg-secondary p-6 rounded-lg shadow-md border border-border-color">
                <h2 class="text-2xl font-bold text-text-primary mb-6">AI Preferences</h2>

                <!-- AI Response Style Selection -->
                <div class="mb-6">
                    <h3 class="text-xl font-semibold text-text-primary mb-3">AI Response Style</h3>
                    <p class="text-text-secondary mb-4">Select how Theora should communicate with you.</p>
                    <div class="flex flex-col space-y-2">
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="normal" ${appState.aiResponseStyle === 'normal' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Normal (Standard responses)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="concise" ${appState.aiResponseStyle === 'concise' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Concise (Brief and to-the-point)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="sapa" ${appState.aiResponseStyle === 'sapa' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Sapa Mode (Low on money, Nigerian pidgin)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio text-primary-blue" name="aiResponseStyle" value="hustle" ${appState.aiResponseStyle === 'hustle' ? 'checked' : ''}>
                            <span class="ml-2 text-text-secondary">Hustle Mode (Productivity focus, Nigerian pidgin)</span>
                        </label>
                    </div>
                </div>

                <!-- Custom AI Modes (Future Enhancement) -->
                <div>
                    <h3 class="text-xl font-semibold text-text-primary mb-3">Custom AI Modes</h3>
                    <p class="text-text-secondary mb-4">Define your own AI response styles. (Coming soon!)</p>
                    <button class="btn-primary opacity-50 cursor-not-allowed">Add Custom Mode</button>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        this.element.querySelectorAll('input[name="aiResponseStyle"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                appState.updateState({ aiResponseStyle: e.target.value });
                appState.addNotification({ message: 'AI Response Style updated!', type: 'success' });
            });
        });
    }

    getHtml() {
        return this.element;
    }
}
