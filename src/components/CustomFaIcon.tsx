import * as Icons from "react-icons/fa";
import {MdError} from "react-icons/md";

const CustomFaIcon = ({name}: { name: keyof typeof Icons | null }) => {
    const FaIcon = name ? Icons[name] : null;

    if (!FaIcon) {
        return <MdError className="text-red-500" title="Invalid or missing icon">?</MdError>;
    }

    return <FaIcon />;
};


export default CustomFaIcon;
