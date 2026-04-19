/**
 * Input / Select / Textarea — thin wrappers around the .input / .input-label CSS classes.
 *
 * All three components accept an optional `label` and `id` prop.
 * When `label` is provided the wrapper renders a <label> above the control.
 *
 * Usage:
 *   <Input label="Amount" id="amount" type="number" placeholder="0.00" />
 *   <Select label="Category" id="category" value={…} onChange={…}>
 *     <option value="food">Food</option>
 *   </Select>
 *   <Textarea label="Notes" id="notes" rows={3} />
 */

function FieldWrapper({ label, id, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

export function Input({ label, id, className = '', ...props }) {
  return (
    <FieldWrapper label={label} id={id}>
      <input id={id} className={['input', className].filter(Boolean).join(' ')} {...props} />
    </FieldWrapper>
  )
}

export function Select({ label, id, children, className = '', ...props }) {
  return (
    <FieldWrapper label={label} id={id}>
      <select id={id} className={['input', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </select>
    </FieldWrapper>
  )
}

export function Textarea({ label, id, className = '', rows = 3, ...props }) {
  return (
    <FieldWrapper label={label} id={id}>
      <textarea
        id={id}
        rows={rows}
        className={['input resize-none', className].filter(Boolean).join(' ')}
        {...props}
      />
    </FieldWrapper>
  )
}
