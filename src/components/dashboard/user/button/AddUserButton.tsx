import {useState} from 'react'
import {Button} from '@/components/ui/button'
import EditUserModal from "@/components/dashboard/user/modal/EditUserModal.tsx";
import {Plus} from "lucide-react";

export default function AddUserButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)} className="mb-4">
                <Plus className="mr-2 h-4 w-4" />
                Add User
            </Button>
            {isModalOpen && (
                <EditUserModal onClose={() => setIsModalOpen(false)} />
            )}
        </>
    )
}

