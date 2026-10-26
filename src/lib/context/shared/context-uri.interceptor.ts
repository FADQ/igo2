import { HttpInterceptorFn } from '@angular/common/http';

// TODO : à retirer lorsque le back-end FADQ supportera /contexts/uri/{uri}/details
// IGO gère les contextes. IGO FADQ est une exception en gérant ses contextes.
// Il faudrait changer notre back-end pour se coller à celui de la LIB.
export const contextUriFixInterceptor: HttpInterceptorFn = (req, next) => {
  if (/\/contexts\/uri\/[^/]+\/details$/.test(req.url)) {
    return next(req.clone({ url: req.url.replace('/contexts/uri/', '/contexts/') }));
  }
  return next(req);
};