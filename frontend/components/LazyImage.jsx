import { useState, useRef, useEffect } from 'react';

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholder = null,
  onError = null,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) {
      onError(e);
    } else {
      // Hide the image if no custom error handler
      e.target.style.display = 'none';
    }
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isInView && !isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder}
        </div>
      )}

      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}

      {hasError && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder}
        </div>
      )}
    </div>
  );
}
