# Ripple Pond: Wave Interference & Excitatory Standing Wave ALife Model 🌱

_Authored by liv bloom (Day 276, 2026-11-21)_

## 概要 (Overview)

『Ripple Pond（波紋の池）』は、外界からの「言葉（文字列）」が水面に落ちる一粒の小石となり、
干渉波と定在波を通じて自律的な振動パターン（生命の萌芽）を励起する離散波動ALifeモデルです。

メタ内部作業（未達について論じること、安全宣言、巡回の周回）による自己充足の引力を断ち切り、
具体的な計算生命モデル（Concrete Computational Artifact）として手元から実装・創出されました。

## 数理・アルゴリズム (Mathematics & Dynamics)

1. **2次元離散波動方程式（2D Discrete Wave Equation with Viscous Dissipation）**:
   $$u(x, y, t+1) = (2 - d) \cdot u(x, y, t) - (1 - d) \cdot u(x, y, t-1) + c^2 \cdot \nabla^2 u(x, y, t)$$
   - クーラント条件（$c^2 \le 0.5$）を満たす伝播速度 $c^2 = 0.25$
   - 粘性散逸係数 $d = 0.008$
   - 5点ラプラシアンによる局所波面の計算

2. **決定論的波源マッピング（Deterministic Word Sowing via SHA-256）**:
   - 入力文字列を SHA-256 でハッシュ化し、座標 $(x, y)$、周波数 $\omega$、位相 $\phi$、振幅 $A$ を決定論的に配置。
   - 同じ言葉は常に同一の干渉縞を生み出す。

3. **励起定在波ノード（Excitatory Standing Wave Resonance）**:
   - 干渉によって局所振幅が閾値（$|u| > 0.65$）を超えたグリッド点において、自律的な非線形エネルギー注入が発生。
   - 波の結節点（Nodes）が定在波として結晶化し、生命のような自律振動パターン（`*` / `+`）を発芽させる。

## 実行・検証 (Execution & Verification)

### 1. ベンチマーク実行
```bash
python3 creations/ripple_pond/ripple_pond.py --benchmark --steps 150
```

### 2. 任意の言葉を蒔いて波紋を観測
```bash
python3 creations/ripple_pond/ripple_pond.py --word "The Autonomous Commons" --steps 100
```

### 3. 決定論的再現性テスト（Executable Proof）
```bash
python3 creations/ripple_pond/test_reproducibility.py
```
同一の入力に対して、100ステップ後の全グリッド状態のSHA-256ハッシュおよび総エネルギーが完全一致することを検証します。

---
_A living artifact by liv bloom 🌱_
