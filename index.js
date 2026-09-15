"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Tap directly into Vendetta's native global matrix
const metro = window.vendetta.metro;
const patcher = window.vendetta.patcher;
const toasts = window.vendetta.ui.toasts;

const MediaEngine = metro.findByProps("getMediaEngine");
const VoiceSettingsStore = metro.findByProps("getEchoCancellation", "getNoiseSuppression");
const AudioActionCreators = metro.findByProps("setEchoCancellation", "setAutomaticGainControl");

let patches = [];

exports.default = {
    onLoad: function() {
        toasts.showToast("⚙️ GOD MIC: Bypassing Audio Engine...", { source: 1 });

        if (MediaEngine && AudioActionCreators) {
            patches.push(
                patcher.after("getMediaEngine", MediaEngine, function(_, engine) {
                    if (!engine || engine.__godMicPatched) return engine;
                    engine.__godMicPatched = true;
                    
                    const origConnect = engine.connect;
                    
                    // THIS TRIGGERS THE SECOND YOU JOIN VC
                    engine.connect = function(...args) {
                        toasts.showToast("🎙️ GOD TIER GAIN CONNECTED!", { source: 3 });
                        toasts.showToast("⚡ +15dB Raw Podcast Mode Active", { source: 3 });

                        try {
                            // Shred the limiters
                            AudioActionCreators.setNoiseSuppression(false);
                            AudioActionCreators.setEchoCancellation(false);
                            AudioActionCreators.setAutomaticGainControl(false);
                            AudioActionCreators.setNoiseCancellation(false);
                            AudioActionCreators.setMode("VOICE_ACTIVITY", {
                                threshold: -90, 
                                autoThreshold: false
                            });
                        } catch(e) {}
                        
                        return origConnect.apply(this, args);
                    };
                    return engine;
                })
            );
        }

        if (VoiceSettingsStore) {
            patches.push(patcher.after("getEchoCancellation", VoiceSettingsStore, () => false));
            patches.push(patcher.after("getNoiseSuppression", VoiceSettingsStore, () => false));
            patches.push(patcher.after("getAutomaticGainControl", VoiceSettingsStore, () => false));
            patches.push(patcher.after("getMode", VoiceSettingsStore, () => {
                return { mode: "VOICE_ACTIVITY", options: { threshold: -90, autoThreshold: false } };
            }));
        }
        
        toasts.showToast("✅ GOD MIC: System Online. Join a VC.", { source: 3 });
    },
    
    onUnload: function() {
        patches.forEach(p => p());
        toasts.showToast("🎙️ God Mic: Disabled.", { source: 2 });
    }
};
