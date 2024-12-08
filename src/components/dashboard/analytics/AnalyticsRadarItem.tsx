import {PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer} from "recharts";

const data = [
    {page: 'Github', A: 546, fullMark: 2400},
    {page: 'Website', A: 353, fullMark: 2400},
    {page: 'App', A: 525, fullMark: 2400},
    {page: 'Design', A: 189, fullMark: 2400},
];

function AnalyticsRadarItem() {
    return (
        <div style={{width: '100%', height: '400px'}}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid/>
                    <PolarAngleAxis dataKey="page"/>
                    <PolarRadiusAxis/>
                    <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default AnalyticsRadarItem;