from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, TransactionViewSet, ActivityTypeViewSet, MultiplierRuleViewSet

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'activity-types', ActivityTypeViewSet, basename='activitytype')
router.register(r'multiplier-rules', MultiplierRuleViewSet, basename='multiplierrule')

urlpatterns = router.urls 