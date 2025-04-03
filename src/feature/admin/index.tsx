import {Main} from "@/components/layout/main.tsx";
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {TrendingUp} from "lucide-react";

function Admin() {
    return (
        <Main>
            <div className='mb-2 flex items-center justify-between space-y-2'>
                <h1 className='text-2xl font-bold tracking-tight'>Admin-Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Reports Snapshot</CardTitle>
                                <CardDescription className="text-zinc-400">Demographic properties of your
                                    customer</CardDescription>
                            </div>
                            <Button variant="outline"
                                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                Select Date <span className="ml-1">▼</span>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <Card className="bg-gradient-to-br from-red-600 to-red-800 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-sm font-medium text-white/80">All User</p>
                                        <p className="text-2xl font-bold mt-1">10,234</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-sm font-medium text-white/80">Event Count</p>
                                        <p className="text-2xl font-bold mt-1">536</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-sm font-medium text-white/80">Conversations</p>
                                        <p className="text-2xl font-bold mt-1">21</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-sm font-medium text-white/80">New User</p>
                                        <p className="text-2xl font-bold mt-1">3321</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="h-80">
                                {/*
                                <LineChart/>
*/}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - takes up 1/3 of the space */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Users</CardTitle>
                                <span className="text-4xl font-bold text-pink-500 flex items-center">
                    63 <TrendingUp className="h-4 w-4 ml-1"/>
                  </span>
                            </div>
                            <CardDescription className="text-zinc-400">In Last 30 Minutes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">User Per Minutes</p>
                            <div className="h-10">
                                {/*
                                <BarChart/>
*/}
                            </div>

                            <div className="mt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800">
                                            <TableHead className="text-zinc-400">Top Countries</TableHead>
                                            <TableHead className="text-right text-zinc-400">Users</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            {country: "Bangladesh", users: "05"},
                                            {country: "India", users: "06"},
                                            {country: "Pakistan", users: "06"},
                                            {country: "Australia", users: "10"},
                                            {country: "America", users: "08"},
                                        ].map((row) => (
                                            <TableRow key={row.country} className="border-zinc-800">
                                                <TableCell>{row.country}</TableCell>
                                                <TableCell className="text-right">{row.users}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Main>
    );
}

export default Admin;