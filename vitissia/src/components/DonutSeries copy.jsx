import React from "react";
import { PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, CircularChartTooltip3D, CircularChart3DComponent, CircularChart3DSeriesCollectionDirective, CircularChart3DSeriesDirective, Inject } from '@syncfusion/ej2-react-charts';
import { Browser } from '@syncfusion/ej2-base';

const DonutSeries = ({ data }) => {
    const SAMPLE_CSS = `
        .control-fluid {
            padding: 0px !important;
        }`;

    const onChartLoad = (args) => {
        let chart = document.getElementById('charts');
        chart.setAttribute('title', '');
    };

    const load = (args) => {
        // Optionnel : charger un thème spécifique
    };

    return (
        <div className='control-pane'>
            <style>{SAMPLE_CSS}</style>
            <div className='control-section'>
                <div>
                    <CircularChart3DComponent
                        id='charts'
                        style={{ textAlign: "center" }}
                        legendSettings={{ visible: false }}
                        tilt={-30}
                        enableRotation={true}
                        load={load.bind(this)}
                        title='Répartition par Pays'
                        loaded={onChartLoad.bind(this)}
                        tooltip={{ enable: true, header: "${point.x}", format: 'Valeur : <b>${point.y}' }}
                    >
                        <Inject services={[PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, CircularChartTooltip3D]} />
                        <CircularChart3DSeriesCollectionDirective>
                            <CircularChart3DSeriesDirective
                                dataSource={data}
                                xName='x'
                                yName='y'
                                innerRadius='65%'
                                radius={Browser.isDevice ? '45%' : '75%'}
                                dataLabel={{
                                    visible: true,
                                    name: 'x',
                                    position: 'Outside',
                                    font: { fontWeight: '600' },
                                    connectorStyle: { length: Browser.isDevice ? '20px' : '40px' }
                                }}
                            />
                        </CircularChart3DSeriesCollectionDirective>
                    </CircularChart3DComponent>
                </div>
            </div>
        </div>
    );
};

export default DonutSeries;
