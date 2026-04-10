interface Props {
  label: string;
  variant?: 'indigo' | 'red' | 'green' | 'amber';
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  red:    'bg-red-50 text-red-700 border-red-200',
  green:  'bg-green-50 text-green-700 border-green-200',
  amber:  'bg-amber-50 text-amber-700 border-amber-200',
};

export default function Badge({ label, variant = 'indigo' }: Props) {
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[variant]}`}>
      {label}
    </span>
  );
}