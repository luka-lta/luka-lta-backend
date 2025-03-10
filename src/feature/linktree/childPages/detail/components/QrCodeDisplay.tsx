import {QRCodeCanvas} from "qrcode.react";
import logo from "@/assets/logo.png";

interface QrCodeDisplayProps {
    link: string;
}

function QrCodeDisplay({link}: QrCodeDisplayProps) {
    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500">Scan QR Code</h2>
            </div>

            <div className="flex items-center justify-center">
                <QRCodeCanvas
                    value={link}
                    size={250}
                    imageSettings={{
                        src: logo,
                        excavate: true,
                        height: 50,
                        width: 50,
                    }}/>
            </div>
        </>
    );
}

export default QrCodeDisplay;