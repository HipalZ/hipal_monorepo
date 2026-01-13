# Title: Common Access Project
///
# Details:

1.  **language**: _typescript_
2.  **target**: _ESM_
3.  **framework**: _react_
4.  **bundler**: _vite_
5.  **css**: _tailwindcss_
6.  **node**: 18 lts
7.  **react**: 18
8.  **build-tool**: SWC

# VSCode extensions required:

1. **Better Comments**
2. **Error Lens**
3. **Sonarlint**
4. **Eslint**
5. **Prettier**
6. **Tailwindcss**

# Libraries to be used:

- **react-router-dom** - for router navigation
- **zustand** - for state management
- **formik** - for form handling
- **zod** - for validations and parsing ( we only process validated and parsed data).
- **tailwindcss** - for styling and postcss configuration
- **@tanstack/react-query** - for data fetching and caching
- **mui** - for material ui components and sx styling
- **fontsource** - for font imports
- **axios** - for http requests
- **dayjs** - for date formatting and calculation
- **lottie-react** - for animations
- **react-dropzone** - for drag and drop file uploads
- **react-icons** - for icons
- **eslint** - for linting with popular airbnb config
- **prettier** - for code formatting
- **husky** - for git hooks
- **lint-staged** - for linting staged files
- **commitlint** - for commit message linting
- **autoAnimated** - for auto animated components

# Components required:

1. **ThreeDotMenu**
   | atoms | molecules |
   | ----- | ---------------------- |
   | | three-dot.tsx |

2. **Modal**
   | atoms | molecules |
   | --------------------- | ------------------ |
   | modal.header.atom.tsx | modal.tsx |
   | modal.footer.atom.tsx |

---

3. **BreadCrumbs**
   | atoms | molecules |
   | ----- | ------------------- |
   | | breadcrumb.tsx |

---

4. **GridToolbar**
   | atoms | molecules |
   | ----- | -------------------- |
   | | toolbar.tsx |

---

5. **Login**
   | atoms | molecules |
   | ----- | ------------------ |
   | | login.tsx |
   | |

---

6. **Forgot Password**
   | atoms | molecules |
   | ------------------------------- | ---------------------------- |
   | forgot-password-header.atom.tsx | forgot-password.tsx |

---

7. **Reset Password**
   | atoms | molecules |
   | ----- | --------------------------- |
   | | reset-password.molecule.tsx |

---

---

9. **Dashboard Layout**
   | atoms | molecules |
   | ---------------------- | ------------------------------ |
   | menu.atom.tsx | header.molecule.tsx |
   | menu-item.atom.tsx | sidebar.molecule.tsx |
   | toolbar.atom.jsx | menu-popper.molecule.tsx |
   | | box.molecule.tsx |
   | | footer.molecule.tsx |
   | | popper.molecule.tsx |
   | | user-list-toolbar.molecule.tsx |
   | popper-footer.atom.tsx | grid-toolbar.molecule.tsx |
   | | grid-pagination.molecule.tsx |

---

10. **Modules & Interfaces**
    | atoms | molecules |
    | ----- | --------- |
    | tree.atom.tsx | |

# Suggested Library to prevent syncfusion usage (optional):

_will increase development time but results in better code quality. These Librabries are industry standards and provide better performance and apis to interact with their components, although UI is different changing that only will take time._
/
1. **react-table**
   [Check an example](https://react-table-v7.tanstack.com/docs/examples/filtering).

# Folder Structure:

```bash
├── src
│   ├── apis
│   │   ├── example.api.ts
│   │   ├── index.ts
│   ├── assets
│   ├── components/helpers
│   │   ├── atoms
│   │   │   ├── example.atom.tsx
│   │   │   ├── index.ts
│   │   ├── molecules
│   │   │   ├── example.molecule.tsx
│   │   │   ├── index.ts
│   │   ├── organisms
│   │   │   ├── example.organism.tsx
│   │   │   ├── index.ts
│   │   ├── index.ts
│   ├── hooks
│   │   ├── example.hook.ts
│   │   ├── index.ts
│   ├── validations
│   │   ├── example.validation.ts
│   │   ├── index.ts
│   ├── configs
│   │   ├── example.config.ts
│   │   ├── index.ts
│   ├── constants
│   │   ├── example.constant.ts
│   │   ├── index.ts
│   ├── stores
│   │   ├── example.store.ts
│   │   ├── index.ts
│   ├── types
│   │   ├── stores
│   │   │   ├── example.store.ts
│   │   │   ├── index.ts
│   │   ├── index.ts
│   └── views
│       ├── Example
│       │   ├── New.tsx
│       │   ├── index.ts
│       ├── index.ts
├── dist (or build)
├── node_modules
├── README.md
├── package.json
└── .gitignore
```

# Pipeline required in gitlab:

- Lint -> Format -> tsBuild -> jsBuild -> success

# Guidelines to be followed Strictly:

This guideline is followed by existing guidelines that are already in place. This is a working examples of them.

1. **Lazy Loading** at every subsequent level

```tsx
const Auth = lazy(() => import('@/pages/Auth'));
```

---

2. Use of **React.memo**

```tsx
function Component() {
  return <div>Component</div>;
}
export default React.memo(Component);
```

---

3. Use of **React.useCallback** ( only if function is passed to child component)

```tsx
const handleOnClick = useCallback(() => {
  // do something
}, []);
```

---

4. Use of **React.useMemo** ( only if value is passed to child component or value is based on some other actions like useEffects)

```tsx
WRONG;
const [data, setData] = useState<string[]>([]);
const [filteredData, setFilteredData] = useState<string[]>([]);

useEffect(() => {
  setFilteredData(data.filter((item) => item.includes('a')));
}, [data]);

// better useMemo
RIGHT;
const [data, setData] = useState<string[]>([]);

const filteredData = useMemo(() => {
  return data.filter((item) => item.includes('a'));
}, [data]);
```

---

5. Use of **React.useRef** ( do not forward ref to child component in props, use ForwardRef instead)

```tsx
const value = useRef();
```

---

6. Data Fetching using **react-query**

```tsx
import { useQuery } from '@tanstack/react-query';
const { data, isLoading, isError, refetch } = useQuery<Dish[]>(['dishes'], () =>
  getAllDishes(activeBusiness?._id as string)
    .then((res) => res.data.data)
    .catch((e) => console.error(e)),
);
```

---

7. **Use of anti patterns in if-else**: this is a common mistake that is made by developers. This is a good example of how to avoid it. This prevents unnecessary nesting of code and makes it more readable.

```tsx
// Avoid Nesting
WRONG;
if (condition) {
  return <div>condition is true</div>;
} else {
  return <div>condition is false</div>;
}

RIGHT;
if (condition) return <div>condition is true</div>;
return <div>condition is false</div>;
----------------------------------------------------
WRONG;
if (val === true) {
    // do something
}

RIGHT;
if (!val) return;
```

---

8. **Properly handling every api's response and error.** This is a good example of how to handle it.

```tsx
function handleSendOtp() {
  try {
    const res = await sendLoginOtp(phone);
    if (res.status !== 200) return toast.error(data.message);
    toast.success('OTP sent successfully!');
    // rest of the statements
  } catch (e) {
    console.error(e);
    toast.error(e?.data?.message || e?.message || 'Failed to perform the operation!');
  }
}
```

---

9. Naming Convention

- **Components**: PascalCase
- **Functions**: camelCase
- **Variables**: camelCase
- **Constants**: UPPERCASE
- **Types**: PascalCase
- **Interfaces**: PascalCase
- **Enums**: PascalCase
- **Files**: kebab-case
- **Folders**: kebab-case

---

10. **Use of as const when working with ENUMS**

```tsx
const statuses = ['pending', 'accepted', 'rejected'] as const;
type Status = (typeof statuses)[number];
```

---

11. **Use of React.FC** ( only if props are passed to the component)

```tsx
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>Component</div>;
};
```

---

12. **Use of React.forwardRef** ( only if ref is passed to the component)

```tsx
const Component = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref}>Component</div>;
});
```

---

13. **Prevent .then() and .catch() chaining** ( use async/await instead)

```tsx
WRONG;
function handleSendOtp() {
  sendLoginOtp(phone)
    .then((res) => {
      if (res.status !== 200) return toast.error(data.message);
      toast.success('OTP sent successfully!');
      // rest of the statements
    })
    .catch((e) => {
      console.error(e);
      toast.error(e?.data?.message || e?.message || 'Failed to perform the operation!');
    });
}

RIGHT;
async function handleSendOtp() {
  try {
    const res = await sendLoginOtp(phone);
    if (res.status !== 200) return toast.error(data.message);
    toast.success('OTP sent successfully!');
    // rest of the statements
  } catch (e) {
    console.error(e);
    toast.error(e?.data?.message || e?.message || 'Failed to perform the operation!');
  }
}
```

---

14. **Better Conditional Rendering**

```tsx
WRONG;
function Component() {
  return <div>{condition ? <div>condition is true</div> : <div>condition is false</div>}</div>;
}

RIGHT;
function Component() {
  return (
    <div>
      {condition && <div>condition is true</div>}
      {!condition && <div>condition is false</div>}
    </div>
  );
}
---
// Check for flow State first and then for data
WRONG;
function Component() {
    return <div>
    {loading && <div>Loading...</div>}
    {error && <div>Error</div>}
    {data && <div>Data</div>}
    </div>
}

RIGHT;
function Component() {
    if (loading) return <div>Loading...</div>;
    if (error || !data) return <div>Error</div>;

    return <div>Data</div>;
}
```

---

15. **Don't use any type and always use proper types**

```tsx
WRONG;
function convertBufferToBase64(buffer: any) {
  return Buffer.from(buffer).toString('base64');
}
RIGHT;
function convertBufferToBase64(buffer: Buffer): string {
  return Buffer.from(buffer).toString('base64');
}
```

---

16. Use zustand for state management and splitting the stores for better readability. Use **shallow** to prevent unnecessary re-renders.

```tsx
import create from 'zustand';
import { shallow } from 'zustand/shallow';

const useAuthStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
const useNavigationStore = create((set) => ({
  redirects: 0,
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Component() {
  const count = useStore((state) => state.count, shallow);
  const increment = useStore((state) => state.increment, shallow);
  const redirects = useNavigationStore((state) => state.redirects, shallow);
  const decrement = useNavigationStore((state) => state.decrement, shallow);

  return (
    <div>
      <div>{count}</div>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```

---

17. Keep Folders, Files and imports Organized. Keep single point of import and exports

```tsx
// components/index.ts
export * from './components';
import { SomeComponent } from 'components';
```

18. Keep Types isolated from the components

```tsx
// types.ts
export type SomeType = {
  name: string;
  age: number;
};
```

---

19. Do not prop drill and use store instead.

---

20. Write Readable Code and use comments when its required, do not overexplicitly code comment everything.

---

21. Follow JsDoc and Typescript Doc standards for commenting.

---

22. Always cleanup and remove redundant code when you finsh working on a module.

---

23. Extract Common logic to seperate react hooks and use them in the components.

```tsx
// useSomeLogic.ts
export const useAuth = () => {
  const [someState, setSomeState] = useState(false);

  const login = () => {
    // some logic
  };
  const logout = () => {
    // some logic
  };

  const checkRights = () => {
    // some logic
  };
  const getUserDetails = () => someState;

  return { checkRights, logout, login };
};

// Component.tsx
function Component() {
  const { checkRights, logout, login, getUserDetails } = useAuth();

  return (
    <div>
      <div>Details: {getUserDetails}</div>
      <button onClick={checkRights}>checkRights</button>
      <button onClick={logout}>logout</button>
      <button onClick={login}>login</button>
    </div>
  );
}
```

---

24. Predict Rendering cycles and prevent redundant renders.

_Use React devtools to check for unnecessary renders, Profiler is a tool for that._

---

25. Keep Data Fetching and manipulation logic in Views at views or molecule level.

---

26. Keep React Fundamentals in mind while writing code. Do not decalre Components or Functions inside FunctionComponents or other Components.

_static vars and functions should be outside of FC's Body_

_THIS IS A GENNX EXAMPLE_

```tsx
WRONG;
// at every rerender, react will create a new function and pass it to the child component and therefore reference to the variable will change on each render which is bad.
const userTokenDetails = getLoggedInUser();

RIGHT;
const userTokenDetails = React.useMemo(() => getLoggedInUser(), []);
```

---

27. Do not write logic directly in function component body like if else, loops, etc. Extract them to seperate functions and use them in the component.

_THIS IS A GENNX EXAMPLE_

```tsx
WRONG;
const AuthLayout = (props) => {
  if (userTokenDetails) {
    let beginningTime = moment(new Date());
    let endTime = moment(new Date(userTokenDetails.exp * 1000));
    if (!beginningTime.isBefore(endTime)) dispatch(userSignout({}));
  } else dispatch(userSignout({}));
  if (!isAdmin()) {
    const comeBackPath = props?.location?.pathname ? props?.location?.pathname + props?.location?.hash : undefined;
    if (!getProductVariant) history.push('/selector', { path: comeBackPath });
  }
  return <div>{props.children}</div>;
};

RIGHT;
useEffect(() => {
  if (!userTokenDetails) return dispatch(userSignout({}));
  let beginningTime = moment(new Date());
  let endTime = moment(new Date(userTokenDetails.exp * 1000));
  if (!beginningTime.isBefore(endTime)) return dispatch(userSignout({}));
  if (!isAdmin()) {
    const comeBackPath = props?.location?.pathname ? props?.location?.pathname + props?.location?.hash : undefined;
    if (!getProductVariant) return history.push('/selector', { path: comeBackPath });
  }
}, [userTokenDetails]);
```
