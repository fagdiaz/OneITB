import React, { useState } from 'react'

export const useForm = (initialObj = {}) => {
    const [form, setForm] = useState(initialObj)

    const changed = ({ target }) => {
        const { name, value } = target

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value
        }))
    }

    return {
        form,
        changed,
        setForm,
        reset: () => setForm(initialObj)
    }
}
