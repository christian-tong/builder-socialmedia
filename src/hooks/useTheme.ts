// src\hooks\useTheme.ts
import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export function useTheme() {
    const { theme, toggleTheme, setTheme } = useThemeStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = theme === 'dark'
    const isLight = theme === 'light'

    const getBgColor = () => (isDark ? '#0e0e10' : '#fafafa')
    const getTextColor = () => (isDark ? '#f5f5f5' : '#111111')

    return {
        theme,
        toggleTheme,
        setTheme,
        isDark,
        isLight,
        getBgColor,
        getTextColor,
        mounted,
    }
}
