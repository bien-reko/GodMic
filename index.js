// GOD SLAYER S-TIER VENDETTA/REVENGE MIC INJECTION
const { findByProps } = vendetta.metro;
const { after } = vendetta.patcher;
const { showToast } = vendetta.ui.toasts;

const MediaEngine = findByProps("getMediaEngine");
const VoiceSettingsStore = findByProps("getEchoCancellation", "getNoiseSuppression");
const AudioActionCreators = findByProps("setEchoCancellation", "setNoiseSuppression");

let patches = [];

module.exports = {
    onLoad: () => {
        showToast("🎙️ GOD MIC ACTIVE: S-TIER", { source: 3 });

        if (MediaEngine && AudioActionCreators) {
            patches.push(
                after("getMediaEngine", MediaEngine, (_, engine) => {
                    if (!engine) return;

                    const origConnect = engine.connect;
                    engine.connect = function (...args) {
                        showToast("🎙️ BYPASSING AUDIO COMPRESSION...", { source: 3 });

                        // Nuke all limiters, compressions, and filters
                        AudioActionCreators.setNoiseSuppression(false); // Kills Krisp
                        AudioActionCreators.setEchoCancellation(false); // Kills Echo cutting
                        AudioActionCreators.setAutomaticGainControl(false); // +15dB RAW GAIN BOOST
                        AudioActionCreators.setNoiseCancellation(false);
                        
                        // Lock to raw threshold so words don't get cut off
                        AudioActionCreators.setMode("VOICE_ACTIVITY", {
                            threshold: -90, 
                            autoThreshold: false
                        });

                        return origConnect.apply(this, args);
                    };
                    return engine;
                })
            );
        }

        // Lock the settings so Discord can't turn them back on in the background
        if (VoiceSettingsStore) {
            patches.push(after("getEchoCancellation", VoiceSettingsStore, () => false));
            patches.push(after("getNoiseSuppression", VoiceSettingsStore, () => false));
            patches.push(after("getAutomaticGainControl", VoiceSettingsStore, () => false));
            patches.push(after("getMode", VoiceSettingsStore, () => {
                return { mode: "VOICE_ACTIVITY", options: { threshold: -90, autoThreshold: false } };
            }));
        }
    },

    onUnload: () => {
        patches.forEach(unpatch => unpatch());
        showToast("🎙️ God Mic Disabled. Back to mortal.", { source: 2 });
    }
};
