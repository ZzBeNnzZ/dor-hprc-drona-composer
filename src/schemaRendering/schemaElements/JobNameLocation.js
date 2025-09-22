import React from "react";
import FormElementWrapper from "../utils/FormElementWrapper";
import Text from "../schemaElements/Text";
import Picker from "../schemaElements/Picker";

/**
 * JobNameLocation: composite control for job "name" + "location"
 * Writes to engine keys: "name" and "location"
 */
export default function JobNameLocation({
    // schema-configurable
    showName = true,
    showLocation = true,
    label = "Run destination",
    help,
    labelOnTop = true,

    // pass-through from Composer/FieldRenderer
    sync_job_name,          // e.g., props.sync_job_name
    runLocation,       // e.g., props.runLocation
    onChange,              // forwarded from FieldRenderer (handleValueChange wrapper)
    setError,              // optional; safe to accept/ignore
    ...rest                // future-proof
}) {
    // derive unique ids to avoid collisions

    return (
        <FormElementWrapper
            labelOnTop={labelOnTop}
            name={"name_location"}
            label={label}
            help={help}
        >
            <div className="form-group">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {showName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <label htmlFor="job-name" style={{ whiteSpace: 'nowrap' }}>Job Name</label>
                            <Text
                                name={name}
                                id={"job-name"}
                                label=""
                                useLabel={false}              // suppress inner label; we render our own
                                onNameChange={sync_job_name}   // mirrors previous inline behavior
                                onChange={onChange}           // keep renderer state/hooks consistent
                                placeholder="Drona ID"
                            />
                        </div>
                    )}

                    {showLocation && (
                        <div style={{ display: 'flex', flexGrow: 1, gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ whiteSpace: 'nowrap' }}>Location</label>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Picker
                                    name={"location"}
                                    label=""
                                    useLabel={false}
                                    localLabel="Change"
                                    defaultLocation={runLocation}
                                    onChange={onChange}          // keep renderer state/hooks consistent
                                    style={{ width: "100%", alignItems: "flex-start" }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FormElementWrapper>
    );
}
