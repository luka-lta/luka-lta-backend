import {QRCodeCanvas} from "qrcode.react";
import logo from "@/assets/logo.png";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";

interface QrCodeDisplayProps {
    link: string;
}

function QrCodeDisplay({link}: QrCodeDisplayProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <QRCodeCanvas
                    value={link}
                    size={200}
                    imageSettings={{
                        src: logo,
                        excavate: true,
                        height: 40,
                        width: 40,
                    }}/>
            </CardContent>
        </Card>
    );
}

export default QrCodeDisplay;
