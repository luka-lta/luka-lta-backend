import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Play, RefreshCw, StopCircle} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

interface Service {
    id: string
    name: string
    status: 'running' | 'stopped' | 'error'
    description: string
    lastChecked: string
}

const dummyServices: Service[] = [
    {
        id: '1',
        name: 'Web Server',
        status: 'running',
        description: 'Main web application server',
        lastChecked: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Database',
        status: 'running',
        description: 'Primary database service',
        lastChecked: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Cache Service',
        status: 'stopped',
        description: 'Redis cache service',
        lastChecked: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 Minuten alt
    },
    {
        id: '4',
        name: 'Email Service',
        status: 'error',
        description: 'SMTP email service',
        lastChecked: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 Minuten alt
    }
];

function Services() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadServices = () => {
        setLoading(true);
        setError(null);

        // Simuliere API-Aufruf mit Verzögerung
        setTimeout(() => {
            try {
                // Füge zufällige Statusänderungen für mehr Realismus hinzu
                const randomizedServices = dummyServices.map(service => ({
                    ...service,
                    status: Math.random() > 0.8
                        ? ['running', 'stopped', 'error'][Math.floor(Math.random() * 3)] as 'running' | 'stopped' | 'error'
                        : service.status,
                    lastChecked: new Date().toISOString()
                }));

                setServices(randomizedServices);
            } catch (error) {
                setError('Failed to load services');
                console.log(error);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms Verzögerung simulieren
    };

    useEffect(() => {
        loadServices();
    }, []);

    // Funktion zum Starten/Stoppen von Services
    const handleServiceAction = (serviceId: string, action: 'start' | 'stop') => {
        setServices(prevServices =>
            prevServices.map(service =>
                service.id === serviceId
                    ? {
                        ...service,
                        status: action === 'start' ? 'running' : 'stopped',
                        lastChecked: new Date().toISOString()
                    }
                    : service
            )
        );
    };

    const getStatusBadge = (status: Service['status']) => {
        const variants = {
            running: { class: 'bg-green-500 hover:bg-green-600', text: 'Running' },
            stopped: { class: 'bg-red-500 hover:bg-red-600', text: 'Stopped' },
            error: { class: 'bg-yellow-500 hover:bg-yellow-600', text: 'Error' }
        }
        return <Badge className={variants[status].class}>{variants[status].text}</Badge>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Service Manager</h1>
                <Button onClick={loadServices} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <Card key={service.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{service.name}</CardTitle>
                                    <CardDescription>{service.description}</CardDescription>
                                </div>
                                {getStatusBadge(service.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Last checked: {new Date(service.lastChecked).toLocaleString()}
                </span>
                                <div className="space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleServiceAction(service.id, 'start')}
                                        disabled={service.status === 'running'}
                                    >
                                        <Play className="h-4 w-4 mr-1" /> Start
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleServiceAction(service.id, 'stop')}
                                        disabled={service.status === 'stopped'}
                                    >
                                        <StopCircle className="h-4 w-4 mr-1" /> Stop
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Services;