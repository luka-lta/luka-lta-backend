"use client"

import {Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis} from "recharts"

const data = [
    { month: 'January', Github: 423, website: 743, app: 231 },
    { month: 'February', Github: 312, website: 654, app: 290 },
    { month: 'March', Github: 504, website: 812, app: 340 },
    { month: 'April', Github: 467, website: 789, app: 285 },
    { month: 'May', Github: 389, website: 670, app: 310 },
    { month: 'June', Github: 523, website: 720, app: 367 },
    { month: 'July', Github: 450, website: 805, app: 420 },
    { month: 'August', Github: 398, website: 740, app: 300 },
    { month: 'September', Github: 470, website: 820, app: 360 },
    { month: 'October', Github: 510, website: 790, app: 400 },
    { month: 'November', Github: 490, website: 770, app: 390 },
    { month: 'December', Github: 530, website: 850, app: 410 },
];


function AnalyticsItem() {
    return (
        <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="Github" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3f7dba" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3f7dba" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="website" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#61368a" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#61368a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="app" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8f1348" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8f1348" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="month"/>
                    <YAxis/>
                    <Area dataKey="Github" stackId="1" stroke="#8884d8" fill="url(#Github)" />
                    <Area dataKey="website" stackId="1" stroke="#82ca9d" fill="url(#website)" />
                    <Area dataKey="app" stackId="1" stroke="#ffc658" fill="url(#app)" />

                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default AnalyticsItem;