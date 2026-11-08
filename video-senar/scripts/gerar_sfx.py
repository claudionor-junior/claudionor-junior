# Gera efeitos sonoros simples (sem direitos autorais) para o vídeo.
import numpy as np, wave
SR = 44100
def save(name, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.9, -1, 1)
    with wave.open(f'public/sfx/{name}.wav', 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
t = lambda d: np.linspace(0, d, int(SR * d), endpoint=False)
rng = np.random.default_rng(1)

# Drone de suspense (46s): graves que respiram + ruído filtrado
d = 46; T = t(d)
drone = (np.sin(2*np.pi*55*T) + .6*np.sin(2*np.pi*82.4*T + np.sin(T*.3)) + .3*np.sin(2*np.pi*110.5*T))
drone *= .6 + .4*np.sin(2*np.pi*T/7)
noise = np.convolve(rng.standard_normal(len(T)), np.ones(400)/400, 'same') * 3
x = drone + noise
fade = np.minimum(1, T/2) * np.minimum(1, (d - T)/2)
save('drone', x * fade)

# Impacto (whoosh + boom)
T = t(1.6)
boom = np.sin(2*np.pi*(60*np.exp(-T*3))*T) * np.exp(-T*3)
hit = rng.standard_normal(len(T)) * np.exp(-T*25)
save('impacto', boom*1.2 + hit*.5)

# Bipe de monitor cardíaco (8s, 1 bipe por segundo)
T = t(8); beep = np.zeros_like(T)
for k in range(8):
    s = int(k*SR + .1*SR); n = int(.12*SR)
    beep[s:s+n] = np.sin(2*np.pi*988*t(.12)) * np.hanning(n)
save('bipe', beep)

# Clique / revelação do logo
T = t(.9)
save('logo', (np.sin(2*np.pi*523*T)+np.sin(2*np.pi*784*T)*.7+np.sin(2*np.pi*1046*T)*.4) * np.exp(-T*5) + rng.standard_normal(len(T))*np.exp(-T*60)*.6)

# Notificação (duas notas)
T = t(.5); a = np.sin(2*np.pi*880*T)*np.exp(-T*9); b = np.sin(2*np.pi*1318*T)*np.exp(-T*9)
save('notificacao', np.concatenate([a[:int(.12*SR)], b]))

# Whoosh de transição
T = t(.6); wn = rng.standard_normal(len(T))
k = np.hanning(len(T)); wn = np.convolve(wn, np.ones(60)/60, 'same')
save('whoosh', wn * k)
