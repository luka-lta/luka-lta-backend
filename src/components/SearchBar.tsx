"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input.tsx"
import { Search } from "lucide-react"

interface SearchBarProps {
    onSearch: (searchTerm: string) => void
    placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        onSearch(e.target.value)
    }

    return (
        <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input type="text" placeholder={placeholder} value={searchTerm} onChange={handleChange} className="pl-8" />
        </div>
    )
}

export default SearchBar

