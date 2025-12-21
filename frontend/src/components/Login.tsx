import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface LoginProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    containerRef?: React.RefObject<HTMLDivElement>;
    closable?: boolean;
}

export function Login({ isOpen, onClose, onSuccess, containerRef, closable = true }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        localStorage.setItem('demo-auth', email);
        onSuccess();
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Giriş Yap</CardTitle>
                        {closable && (
                            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Kapat</button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">İşlem yapabilmek için giriş yapmalısınız.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        {closable ? (
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Vazgeç</Button>
                                <Button type="submit" className="flex-1">Devam Et</Button>
                            </div>
                        ) : (
                            <Button type="submit" className="w-full">Giriş Yap</Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
