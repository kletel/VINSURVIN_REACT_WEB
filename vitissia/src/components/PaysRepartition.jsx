import React from "react";
import { MapsComponent, Inject, LayersDirective, LayerDirective, MarkersDirective, MarkerDirective, MapsTooltip, Zoom, Marker } from "@syncfusion/ej2-react-maps";

const PaysRepartition = ({ caves }) => {
    const dataSource = caves.map(cave => ({
        latitude: cave.Latitude,
        longitude: cave.Longitude,
        name: cave.Nom,
        region: cave.Région,
        state: cave.Pays,
        country: cave.Pays
    }));
    console.log("Data source for maps:", dataSource);
    console.log("Caves data:", caves);
    if (!caves.length || !dataSource.length) {
        return <div className="text-center text-gray-500">Aucune donnée disponible pour afficher la répartition.</div>;
    }

    return (
        <div className="control-section" style={{ height: '900px' }}> {/* Augmentez la hauteur ici */}
            <MapsComponent
                id="maps"
                height="800px"
                useGroupingSeparator={true}
                format={"n"}
                /*titleSettings={{
                    text: "Répartition des caves par région",
                    textStyle: { size: "16px", fontFamily: "inherit" }
                }}*/
                zoomSettings={{
                    zoomFactor: 2,
                    enable: true,
                    toolbarSettings: {
                        buttonSettings: {
                            toolbarItems: ["Zoom", "ZoomIn", "ZoomOut", "Pan", "Reset"]
                        }
                    }
                }}
            >
                <Inject services={[Marker, MapsTooltip, Zoom]} />
                <LayersDirective>
                    <LayerDirective urlTemplate="https://tile.openstreetmap.org/level/tileX/tileY.png">
                        <MarkersDirective>
                            <MarkerDirective
                                visible={true}
                                shape="Circle"
                                height={15}
                                width={15}
                                fill="#b38600"
                                border={{ color: "#e6f2ff", width: 2 }}
                                tooltipSettings={{
                                    visible: true,
                                    valuePath: "name",
                                    format: "<b>Nom:</b> ${name} <br/> <b>Région:</b> ${region} <br/> <b>Pays:</b> ${state}",
                                    textStyle: { fontFamily: "inherit" }
                                }}
                                animationDuration={0}
                                dataSource={dataSource}
                            />
                        </MarkersDirective>
                    </LayerDirective>
                </LayersDirective>
            </MapsComponent>
        </div>
    );
};

export default PaysRepartition;
