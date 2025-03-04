from django.urls import path, include

urlpatterns = [
    # Include URLs from submodules
    path('rfid/', include('transactions.rfid.urls')),
    path('payments/', include('transactions.payments.urls')),
] 