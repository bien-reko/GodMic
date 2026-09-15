import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";

const { FormSection, FormSwitchRow, FormSliderRow } = Forms;

export default function Settings() {
    useProxy(storage);
    return (
        <FormSection title="God Mic S-Tier Settings" titleStyleType="no_border">
            <FormSwitchRow
                label="Enable +15dB Raw Mode"
                subLabel="Bypasses all Discord limiters and filters."
                value={storage.boostEnabled}
                onValueChange={(v: boolean) => (storage.boostEnabled = v)}
            />
            <FormSliderRow
                label="Activation Threshold (dB)"
                subLabel="Lower = picks up whispers. Default: -90."
                value={storage.threshold}
                onValueChange={(v: number) => (storage.threshold = v)}
                minimumValue={-100}
                maximumValue={0}
                step={1}
            />
        </FormSection>
    );
}
