import InfoClicksSheet from "@/feature/clicks/components/sheet/info-click-sheet.tsx";
import {useClicksContext} from "@/feature/clicks/context/clicks-context.tsx";

function UserDialogs() {
    const {open, setOpen, currentRow, setCurrentRow} = useClicksContext()

    return (
        <>
            {currentRow && (
                <>
                    <InfoClicksSheet
                        key={`click-info-${currentRow.clickId}`}
                        open={open === 'info'}
                        onOpenChange={() => {
                            setOpen('info')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />
                </>
            )}
        </>
    );
}

export default UserDialogs;