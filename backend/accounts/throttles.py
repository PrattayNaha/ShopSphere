from rest_framework.throttling import AnonRateThrottle

class LoginThrottle(AnonRateThrottle):
    rate = '20/min'   # 5 login attempts per minute per IP
