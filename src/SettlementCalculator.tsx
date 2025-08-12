import React, { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';

export default function SettlementCalculator() {
  // --- Калькулятор №1 (валюта/settlement) ---
  const [currency, setCurrency] = useState('BDT');
  const [amount, setAmount] = useState<string>('1800000');
  const [rate, setRate] = useState<string>('300');
  const [settlementPct, setSettlementPct] = useState<string>('1.5');

  // --- Калькулятор №2 (amount/rate/fee) ---
  const [amount2, setAmount2] = useState<string>('1800000');
  const [rate2, setRate2] = useState<string>('300');
  const [feePct, setFeePct] = useState<string>('1.5');

  const parseNum = (v: string) => {
    if (!v) return 0;
    const norm = v.replace(/\s/g, '').replace(',', '.');
    const n = Number(norm);
    return isFinite(n) ? n : 0;
  };

  // Форматирование: пробелы для тысяч, точка для дробной части (пример: 13 960.63)
  const fmt = (n: number, max = 2) => {
    const nf = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: max,
    });
    return nf.format(Number(n.toFixed(max))).replace(/,/g, ' ');
  };

  // --- Вычисления для калькулятора №1 ---
  const computed1 = useMemo(() => {
    const a = parseNum(amount);
    const r = parseNum(rate);
    const p = parseNum(settlementPct);
    const sumDiv = r > 0 ? a / r : 0;
    const sett = (sumDiv * p) / 100;
    const toSend = sumDiv - sett;
    return { a, r, p, sumDiv, sett, toSend };
  }, [amount, rate, settlementPct]);

  const message1 = useMemo(() => {
    const { a, r, p, sumDiv, sett, toSend } = computed1;
    return [
      `Сумма ${fmt(a)} ${currency}`,
      `Курс ${fmt(r)} ${currency}/USDT`,
      `Сумма ${fmt(sumDiv)} USDT`,
      `Settlement ${p}%= ${fmt(sett)} USDT`,
      `Сумма к отправке ${fmt(toSend)} USDT`,
    ].join('\n');
  }, [computed1, currency]);

  // --- Вычисления для калькулятора №2 ---
  const computed2 = useMemo(() => {
    const a = parseNum(amount2);
    const r = parseNum(rate2);
    const p = parseNum(feePct);
    const res1 = r > 0 ? a / r : 0;                 // 1) сумма / курс
    const res2 = res1 - (res1 * p) / 100;           // 2) результат1 - fee%
    return { a, r, p, res1, res2 };
  }, [amount2, rate2, feePct]);

  const message2 = useMemo(() => {
    const { res1, res2, p } = computed2;
    return [
      'Amount to be sent:',
      '',
      `Сумма / курс = ${fmt(res1)}`,
      `Результат - ${p}% = ${fmt(res2)}`,
    ].join('\n');
  }, [computed2]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Скопировано!');
    } catch {
      alert('Не удалось скопировать');
    }
  };

  const error1 = useMemo(() => {
    const r = parseNum(rate);
    if (r <= 0) return 'Курс должен быть больше 0';
    if (parseNum(amount) < 0) return 'Сумма не может быть отрицательной';
    if (parseNum(settlementPct) < 0) return '% settlement не может быть отрицательным';
    return '';
  }, [amount, rate, settlementPct]);

  const error2 = useMemo(() => {
    const r = parseNum(rate2);
    if (r <= 0) return 'Курс должен быть больше 0';
    if (parseNum(amount2) < 0) return 'Сумма не может быть отрицательной';
    if (parseNum(feePct) < 0) return 'Fee % не может быть отрицательным';
    return '';
  }, [amount2, rate2, feePct]);

  return (
    <div>
      {/* ===== Калькулятор №1 ===== */}
      <div className="grid2">
        <div className="card">
          <label>Валюта</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="например, BDT"
          />
          <div className="small">Будет использовано как левая часть пары: {currency || 'XXX'}/USDT</div>
        </div>
        <div className="card">
          <label>Сумма</label>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="например, 1800000"
          />
        </div>
        <div className="card">
          <label>Курс ({currency || 'XXX'}/USDT)</label>
          <input
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="например, 300"
          />
        </div>
        <div className="card">
          <label>Settlement %</label>
          <input
            inputMode="decimal"
            value={settlementPct}
            onChange={(e) => setSettlementPct(e.target.value)}
            placeholder="например, 1.5"
          />
        </div>
      </div>

      <div className="grid3" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="kpi-title">1) Сумма / курс</div>
          <div className="kpi-value">{fmt(computed1.sumDiv)} USDT</div>
        </div>
        <div className="card">
          <div className="kpi-title">2) {settlementPct || 0}% от результата</div>
          <div className="kpi-value">{fmt(computed1.sett)} USDT</div>
        </div>
        <div className="card">
          <div className="kpi-title">3) К отправке</div>
          <div className="kpi-value">{fmt(computed1.toSend)} USDT</div>
        </div>
      </div>

      {error1 && <div className="error">{error1}</div>}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="copybar">
          <div className="kpi-title">Сообщение для копирования</div>
          <button className="btn" onClick={() => copyText(message1)} type="button">
            <Copy size={16} /> Скопировать
          </button>
        </div>
        <textarea readOnly value={message1} rows={7} />
        <div className="footer">
          Подсказки: вводите десятичные через точку или запятую; форматирование — пробелы для тысяч и точка для дробной части.
        </div>
      </div>

      {/* ===== Разделитель ===== */}
      <div style={{ height: 28 }} />

      {/* ===== Калькулятор №2 (Amount/Rate/Fee) ===== */}
      <h2 style={{ margin: '0 0 12px', fontSize: 20 }}>Калькулятор (Amount / Rate / Fee%)</h2>

      <div className="grid2">
        <div className="card">
          <label>Сумма</label>
          <input
            inputMode="decimal"
            value={amount2}
            onChange={(e) => setAmount2(e.target.value)}
            placeholder="например, 1800000"
          />
        </div>
        <div className="card">
          <label>Курс</label>
          <input
            inputMode="decimal"
            value={rate2}
            onChange={(e) => setRate2(e.target.value)}
            placeholder="например, 300"
          />
        </div>
        <div className="card">
          <label>Fee %</label>
          <input
            inputMode="decimal"
            value={feePct}
            onChange={(e) => setFeePct(e.target.value)}
            placeholder="например, 1.5"
          />
        </div>
      </div>

      <div className="grid3" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="kpi-title">1) Сумма / курс</div>
          <div className="kpi-value">{fmt(computed2.res1)}</div>
        </div>
        <div className="card">
          <div className="kpi-title">2) Результат - Fee%</div>
          <div className="kpi-value">{fmt(computed2.res2)}</div>
        </div>
        <div className="card" />
      </div>

      {error2 && <div className="error">{error2}</div>}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="copybar">
          <div className="kpi-title">Сообщение для копирования</div>
          <button className="btn" onClick={() => copyText(message2)} type="button">
            <Copy size={16} /> Скопировать
          </button>
        </div>
        <textarea readOnly value={message2} rows={6} />
        <div className="footer">
          Формат вывода: 
          <br/>Amount to be sent:
          <br/>Сумма / курс = &lt;результат1&gt;
          <br/>Результат - fee% = &lt;результат2&gt;
        </div>
      </div>
    </div>
  );
}
