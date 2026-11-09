import { QRCodeCanvas } from "qrcode.react";
import logo from "@/assets/logo.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

function QrCodeDisplay({ link }: { link: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>QR-Code</CardTitle>
                <CardDescription>Führt direkt zur Ziel-URL.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                {/* Weißer Rand, damit der Code auch im Dark Mode scannbar bleibt */}
                <div className="rounded-lg bg-white p-3">
                    <QRCodeCanvas
                        value={link}
                        size={176}
                        title={`QR-Code für ${link}`}
                        imageSettings={{ src: logo, excavate: true, height: 36, width: 36 }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default QrCodeDisplay;
