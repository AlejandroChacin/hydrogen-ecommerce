import { useIsHomePath } from '~/lib/utils';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
} from '~/components';
import { useParams, Form, Await, useMatches } from '@remix-run/react';
import { useWindowScroll } from 'react-use';
import { Suspense, useEffect, useMemo } from 'react';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { useCartFetchers } from '~/hooks/useCartFetchers';

export function Layout({ children, layout }) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header
          title='Bellroy'
          menu={layout?.headerMenu}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer menu={layout?.footerMenu} />
    </>
  );
}

function Header({ title, menu }) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({ isOpen, onClose }) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({ isOpen, onClose, menu }) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({ menu, onClose }) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      <Link to="/collections">
        <p className='pb-1'>Colecciones</p>
      </Link>
      <Link to="/products">
        <p className='pb-1'>Productos</p>
      </Link>
    </nav>
  );
}

function MobileHeader({ title, isHome, openCart, openMenu }) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${isHome
        ? 'bg-contrast/80 text-primary'
        : 'bg-contrast/80 text-primary'
        } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading className="font-bold text-center" as={isHome ? 'h1' : 'h2'}>
          {title}
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
        </Form>
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function DesktopHeader({ isHome, menu, openCart, title }) {
  const params = useParams();
  const { y } = useWindowScroll();
  return (
    <header
      role="banner"
      className={`${isHome
        ? 'bg-contrast/80 text-primary shadow-lightHeader'
        : 'bg-contrast/80 text-primary'
        } ${!isHome && y > 50 && ' shadow-lightHeader'
        } hidden h-nav lg:flex items-center sticky transition duration-300 backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-8`}
    >
      <div className="flex gap-12">
        <Link className="font-bold" to="/" prefetch="intent">
          {title}
        </Link>
        <nav className="flex gap-8">
          {/* Top level menu items */}
          <Link to="/collections">
            <p className='pb-1'>Colecciones</p>
          </Link>
          <Link to="/products">
            <p className='pb-1'>Productos</p>
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
          >
            <IconSearch />
          </button>
        </Form>
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function CartCount({ isHome, openCart }) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({ openCart, dark, count }) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        <div
          className={`${dark
            ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
            : 'text-contrast bg-primary'
            } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({ menu }) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[15rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
        bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    >
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        Todos los derechos reservados &copy; {new Date().getFullYear()} Bellroy Pty Ltd.
      </div>
    </Section>
  );
}
