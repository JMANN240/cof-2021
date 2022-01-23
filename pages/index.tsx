import { useEffect, useState } from "react"

export default function Homepage() {
    const [date, setDate] = useState('');
    useEffect(() => {
        const intv = setInterval(function() {
            setDate(new Date().toLocaleString())
        }, 1000);
        return () => clearInterval(intv);
    }, [])
    return <div>
        hi there! {date}
        <br />
        <a href="/api/what">/api/what</a>
        <br />
        <a href="/api/win">new window</a>
    </div>
}