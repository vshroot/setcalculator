import React, { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';

export default function SettlementCalculator() {
  const [currency, setCurrency] = useState('BDT');
  const [amount, setAmount] = useState<string>('1800000');
  const [rate, setRate] = useState<string>('300');
  const [settlementPct, setSettlementPct] = useState<string>('1.5');

  const parseNum = (v: string) => {
    if (!v) return 0;
    const norm = v.replace(/\s/g, '').replace(',', '.');
    const n = Number(norm);
    return isFinite(n) ? n : 0;
  };

  // Форматируем числа с точкой в качестве десятичного разделителя
  const fmt = (n: number, max = 2) => {
    const nf = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: max,
    });
    return nf.format(Number(n.toFixed(max)));
  };

  const computed = useMemo(() => {
    const a = parseNum(amount);
    const r = parseNum(rate);
    const p = parseNum(settlementPct);
    const sumDiv = r > 0 ? a / r : 0;
    const sett = (sumDiv * p) / 100;
    const toSend = sumDiv - sett;
    return { a, r, p, sumDiv, sett, toSend };
  }, [amount, rate, settlementPct]);

  const message = useMemo(() => {
    const { a, r, p, sumDiv, sett, toSend } = computed;
    return [
      `Сумма ${fmt(a)} ${currency}`,
      `Курс ${fmt(r)} ${currency}/USDT`,
      `Сумма ${fmt(sumDiv)} USDT`,
      `Settlement ${p}%= ${fmt(sett)} USDT`,
      `Сумма к отправке ${fmt(toSend)} USDT`,
    ].join('\n');
  }, [computed, currency]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert('Скопировано!');
    } catch {
      alert('Не удалось скопировать');
    }
  };

  const error = useMemo(() => {
    const r = parseNum(rate);
    if (r <= 0) return 'Курс должен быть больше 0';
    if (parseNum(amount) < 0) return 'Сумма не может быть отрицательной';
    if (parseNum(settlementPct) < 0) return '% settlement не может быть отрицательным';
    return '';
  }, [amount, rate, settlementPct]);

  return (
    <div>
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
          <div className="kpi-value">{fmt(computed.sumDiv)} USDT</div>
        </div>
        <div className="card">
          <div className="kpi-title">2) {settlementPct || 0}% от результата</div>
          <div className="kpi-value">{fmt(computed.sett)} USDT</div>
        </div>
        <div className="card">
          <div className="kpi-title">3) К отправке</div>
          <div className="kpi-value">{fmt(computed.toSend)} USDT</div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="copybar">
          <div className="kpi-title">Сообщение для копирования</div>
          <button className="btn" onClick={copyToClipboard} type="button">
            <Copy size={16} /> Скопировать
          </button>
        </div>
        <textarea readOnly value={message} rows={7} />
        <div className="footer">
          Подсказки: можно вводить десятичные части через точку или запятую; форматирование чисел — английская локаль (точка как разделитель дробной части).
        </div>
      </div>
    </div>
  );
}
