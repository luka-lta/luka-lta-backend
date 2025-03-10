'use client'

import React, {useState} from 'react'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog.tsx'
import {Input} from '@/components/ui/input.tsx'
import {Label} from '@/components/ui/label.tsx'
import {Button} from '@/components/ui/button.tsx'
import {toast} from "sonner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

type User = {
    id: number
    name: string
    email: string
    role: string
}

type EditUserModalProps = {
    user?: User
    onClose: () => void
}

export default function EditUserModal({user, onClose}: EditUserModalProps) {
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Erste Datei aus der Datei-Liste
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatar(reader.result as string); // Setze die Data-URL als Avatar
            };
            reader.readAsDataURL(file); // Lies die Datei als Data-URL
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        if (user) {
            formData.append('id', user.id.toString())
        }
        formData.append('name', name)
        formData.append('email', email)
        formData.append('avatar', avatar || '')

        if (user) {
            toast.success('User edited successfully')
        } else {
            // Add user
            toast.success('User added successfully')
        }
        onClose()
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Label htmlFor="avatar">Avatar</Label>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            {avatar ? (
                                <AvatarImage src={avatar} alt="Avatar"/>
                            ) : (
                                <AvatarFallback>?</AvatarFallback>
                            )}
                        </Avatar>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            required
                        />
                    </div>
                    <Button type="submit">{user ? 'Update' : 'Add'} User</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

