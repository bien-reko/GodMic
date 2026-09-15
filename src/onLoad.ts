import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";

const MediaEngine = findByProps("getMediaEngine");
const VoiceSettingsStore = findByProps("getEchoCancellation", "getNoiseSuppression");
const AudioActionCreators = findByProps("setEchoCancellation", "setAutomaticGainControl");

export let patches: Function[] = [];

export default function onLoad() {
    storage.boostEnabled = storage.boostEnabled ?? true;
    storage.threshold = storage.threshold ?? -90;

    if (MediaEngine && AudioActionCreators) {
        patches.push(
            after("getMediaEngine", MediaEngine, (_, engine: any) => {
                if (!engine || engine.__godMicPatched) return engine;
                engine.__godMicPatched = true;
                
                const origConnect = engine.connect;
                engine.connect = function(this: any, ...args: any[]) {
                    if (storage.boostEnabled) {
                        showToast(`🎙️ GOD TIER MIC | +15dB | Thresh: ${storage.threshold}dB`, { source: 3 });
                        try {
                            AudioActionCreators.setNoiseSuppression(false);
                            AudioActionCreators.setEchoCancellation(false);
                            AudioActionCreators.setAutomaticGainControl(false);
                            AudioActionCreators.setNoiseCancellation(false);
                            AudioActionCreators.setMode("VOICE_ACTIVITY", { threshold: storage.threshold, autoThreshold: false });
                        } catch(e) {}
                    }
                    return origConnect.apply(this, args);
                };
                return engine;
            })
        );
    }
}
