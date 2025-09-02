import { Card, Text, TextProps } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useSnapshot } from 'valtio';
import {
  BASE_CURRENCY,
  VAT_RATE,
  HEALTH_CAP_MAX_WAGES_BEFORE_CHANGE,
  HEALTH_CAP_MAX_WAGES_AFTER_CHANGE,
  HEALTH_CAP_CHANGE_YEAR,
} from '~/lib/config';
import { ExchangeRates } from '~/lib/exchangeRates';
import { formatAsBaseCurrency, formatExchangeRate } from '~/lib/format';
import { state } from '~/lib/state';
import { ExchangeRatesLoadingOverlay } from './ExchangeRatesLoadingOverlay';
import classes from './SettingsInfoCard.module.css';

const commonTextProps: TextProps = { size: 'sm', ta: 'center' };

export type SettingsInfoCardProps = {
  grossIncomeOverVATThreshold: boolean | undefined;
  exchangeRates: ExchangeRates | undefined;
  exchangeRatesLoading: boolean | undefined;
};

export function SettingsInfoCard({
  grossIncomeOverVATThreshold,
  exchangeRatesLoading,
  exchangeRates,
}: SettingsInfoCardProps) {
  const { vatThreshold, income, incomeCurrency, minimumWage, deductibleExpenses, deductibleExpensesCurrency } =
    useSnapshot(state);
  const usedExchangeRates = [];
  if (income && incomeCurrency && incomeCurrency !== BASE_CURRENCY && exchangeRates) {
    usedExchangeRates.push({
      value: exchangeRates[incomeCurrency],
      currency: incomeCurrency,
    });
  }
  if (
    deductibleExpenses &&
    deductibleExpensesCurrency &&
    deductibleExpensesCurrency !== BASE_CURRENCY &&
    deductibleExpensesCurrency !== incomeCurrency &&
    exchangeRates
  ) {
    usedExchangeRates.push({
      value: exchangeRates[deductibleExpensesCurrency],
      currency: deductibleExpensesCurrency,
    });
  }
  const usedExchangeRatesCount = usedExchangeRates.length;
  const multipleExchangeRates = usedExchangeRatesCount > 1;

  return (
    <Card className={classes.root} p="md" withBorder radius="md" pos="relative" display="flex">
      <ExchangeRatesLoadingOverlay exchangeRatesLoading={exchangeRatesLoading} />
      <IconInfoCircle className={clsx(classes.icon, { [classes.warning]: grossIncomeOverVATThreshold })} />
      <div>
        {grossIncomeOverVATThreshold && (
          <Text {...commonTextProps} c="orange">
            Plafonul de TVA este de <span className="nowrap">{formatAsBaseCurrency(vatThreshold)}</span> pe an.
          </Text>
        )}
        <Text {...commonTextProps}>
          Salariul minim pe economie <span className="nowrap">este de {formatAsBaseCurrency(minimumWage)}</span>.
        </Text>
        <Text {...commonTextProps}>
          Cota standard de TVA este {Math.round(VAT_RATE * 100)}%.
        </Text>
        <Text {...commonTextProps}>
          Plafonul de TVA crește la <span className="nowrap">{formatAsBaseCurrency(395_000)}</span> începând cu 1 septembrie 2025. PFA-urile care facturează peste acest prag devin plătitoare de TVA.
        </Text>
        <Text {...commonTextProps}>
          Plafonul maxim anual pentru CASS crește de la {HEALTH_CAP_MAX_WAGES_BEFORE_CHANGE} la {HEALTH_CAP_MAX_WAGES_AFTER_CHANGE} salarii minime (aplicabil veniturilor din {HEALTH_CAP_CHANGE_YEAR}). Valoarea curentă: <span className="nowrap">{formatAsBaseCurrency(minimumWage * HEALTH_CAP_MAX_WAGES_BEFORE_CHANGE)}</span>; după modificare: <span className="nowrap">{formatAsBaseCurrency(minimumWage * HEALTH_CAP_MAX_WAGES_AFTER_CHANGE)}</span>.
        </Text>
        {usedExchangeRatesCount > 0 && (
          <Text {...commonTextProps}>
            Cursu{multipleExchangeRates ? 'rile' : 'l'} de schimb folosit{multipleExchangeRates ? 'e' : ''}:{' '}
            {usedExchangeRates.map((rate, index) => (
              <span key={rate.currency} className="nowrap">
                {index === 1 ? ' și ' : ''}
                {formatExchangeRate(rate)}
              </span>
            ))}
            .
          </Text>
        )}
      </div>
      <Text {...commonTextProps}>
        Vezi aici <Link href="/setari">setările</Link>.
      </Text>
    </Card>
  );
}
